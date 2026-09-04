import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  History,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  X,
  ShieldCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';
import type { Gender, Measurements, PhotoLandmarks, PhotoAnalysisStep } from '../types';
import { inchToCm, cmToInch } from '../utils/unitConversion';
import {
  calculateSmartRecommendation,
  SIZE_CHARTS,
  type FitPreference,
  type SmartProfile,
  type SmartRecommendation,
} from '../utils/smartRecommendation';
import { analyzeBodyPhoto } from '../utils/photoAnalyzer';
import './SmartSizeStudio.css';

interface HistoryItem {
  id: string;
  createdAt: string;
  profile: SmartProfile;
  result: SmartRecommendation;
}

interface SmartSizeStudioProps {
  measurements: Measurements;
  onMeasurementsChange: (measurements: Measurements) => void;
}

const initialProfile = (m: Measurements): SmartProfile => ({
  gender: (m.gender as Gender) || 'female',
  age: m.age || 26,
  height: m.height || 165,
  weight: m.weight || 62,
  chest: inchToCm(m.bust || 38),
  waist: inchToCm(m.waist || 32),
  hip: inchToCm(m.hip || 40),
  fit: 'Regular',
});

const SmartSizeStudio: React.FC<SmartSizeStudioProps> = ({
  measurements,
  onMeasurementsChange,
}) => {
  const [profile, setProfile] = useState<SmartProfile>(() => initialProfile(measurements));
  const [result, setResult] = useState<SmartRecommendation | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    JSON.parse(localStorage.getItem('smarttailor-size-history') || '[]') as HistoryItem[]
  );

  // Photo Upload & Analysis States
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoAnalysisStep, setPhotoAnalysisStep] = useState<PhotoAnalysisStep>('idle');
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoLandmarks, setPhotoLandmarks] = useState<PhotoLandmarks | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showLandmarkOverlay, setShowLandmarkOverlay] = useState(true);

  const [chartTab, setChartTab] = useState<'Men' | 'Women' | 'Kids'>('Women');
  const [errors, setErrors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('smarttailor-theme') === 'dark'
  );

  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDark);
    localStorage.setItem('smarttailor-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const updateProfile = <K extends keyof SmartProfile>(key: K, value: SmartProfile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const persistHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem('smarttailor-size-history', JSON.stringify(items));
  };

  // Internal recommendation calculation function
  const computeRecommendation = useCallback(
    (prof: SmartProfile, landmarks: PhotoLandmarks | null) => {
      const nextResult = calculateSmartRecommendation(prof, landmarks);
      setResult(nextResult);
      onMeasurementsChange({
        ...measurements,
        gender: prof.gender,
        age: prof.age,
        height: prof.height,
        weight: prof.weight,
        bust: cmToInch(prof.chest),
        waist: cmToInch(prof.waist),
        hip: cmToInch(prof.hip),
        dressSize:
          nextResult.size === 'XXL'
            ? 50
            : nextResult.size === 'XL'
            ? 46
            : nextResult.size === 'L'
            ? 42
            : nextResult.size === 'M'
            ? 38
            : nextResult.size === 'S'
            ? 34
            : 32,
      });
      return nextResult;
    },
    [measurements, onMeasurementsChange]
  );

  // Auto update recommendation whenever profile or photoLandmarks change
  useEffect(() => {
    if (result || photoLandmarks) {
      computeRecommendation(profile, photoLandmarks);
    }
  }, [profile, photoLandmarks]);

  const runAnalysis = () => {
    const nextErrors: string[] = [];
    if (profile.age < 3 || profile.age > 100) nextErrors.push('Age must be between 3 and 100.');
    if (profile.height < 80 || profile.height > 230)
      nextErrors.push('Height must be between 80 and 230 cm.');
    if (profile.weight < 10 || profile.weight > 250)
      nextErrors.push('Weight must be between 10 and 250 kg.');
    if ([profile.chest, profile.waist, profile.hip].some((val) => val < 40 || val > 180))
      nextErrors.push('Measurements must be between 40 and 180 cm.');

    setErrors(nextErrors);
    if (nextErrors.length) return;

    setIsAnalyzing(true);
    window.setTimeout(() => {
      const nextResult = computeRecommendation(profile, photoLandmarks);
      const item: HistoryItem = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        profile,
        result: nextResult,
      };
      persistHistory([item, ...history].slice(0, 12));
      setIsAnalyzing(false);
    }, 450);
  };

  // Immediate Automatic Photo Analysis on Image Upload
  const processImageUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, WebP).');
      setPhotoAnalysisStep('error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    setPhotoError(null);
    setPhotoLandmarks(null);
    setPhotoAnalysisStep('uploading');
    setPhotoProgress(15);

    // Stage 1: Uploading Photo
    await new Promise((res) => setTimeout(res, 400));
    setPhotoProgress(40);
    setPhotoAnalysisStep('analyzing');

    // Stage 2: Analyzing Body Proportions
    await new Promise((res) => setTimeout(res, 600));
    setPhotoProgress(75);
    setPhotoAnalysisStep('recommendations');

    // Perform canvas visual analysis
    const analysis = await analyzeBodyPhoto(objectUrl);

    // Stage 3: Generating Fit Recommendations & Complete
    await new Promise((res) => setTimeout(res, 400));

    if (!analysis.success || !analysis.landmarks) {
      setPhotoError(
        analysis.error || 'Photo analysis needs a clear full-body image for better results.'
      );
      setPhotoAnalysisStep('error');
      setPhotoProgress(0);
    } else {
      setPhotoLandmarks(analysis.landmarks);
      setPhotoAnalysisStep('complete');
      setPhotoProgress(100);

      // Auto update recommendation immediately
      const nextResult = computeRecommendation(profile, analysis.landmarks);
      const item: HistoryItem = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        profile,
        result: nextResult,
      };
      persistHistory([item, ...history].slice(0, 12));
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl(null);
    setPhotoLandmarks(null);
    setPhotoAnalysisStep('idle');
    setPhotoError(null);
    setPhotoProgress(0);
    if (result) {
      computeRecommendation(profile, null);
    }
  };

  const loadHistory = (item: HistoryItem) => {
    setProfile(item.profile);
    setResult(item.result);
    setErrors([]);
  };

  const downloadReport = () => {
    if (!result) return;
    const pdf = new jsPDF();
    pdf.setFillColor(19, 51, 54);
    pdf.rect(0, 0, 210, 34, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text('AI-Based Smart Dress Size Report', 16, 20);

    pdf.setTextColor(35, 45, 48);
    pdf.setFontSize(11);
    let y = 48;

    const genderLabel =
      profile.gender === 'female'
        ? 'Female'
        : profile.gender === 'male'
        ? 'Male'
        : profile.gender === 'other'
        ? 'Other'
        : profile.gender === 'prefer_not_to_say'
        ? 'Prefer not to say'
        : profile.gender;

    const lines = [
      `Generated: ${new Date().toLocaleString()}`,
      `Recommended size: ${result.size}  |  Confidence: ${result.confidence}%`,
      `Body shape: ${result.bodyShape}`,
      `BMI: ${result.bmi} (${result.bmiCategory})`,
      `Fit preference: ${result.fit}`,
      '',
      'MEASUREMENT & PROFILE SUMMARY',
      `Gender Profile: ${genderLabel} (User Selected)`,
      `Age: ${profile.age}  |  Height: ${profile.height} cm  |  Weight: ${profile.weight} kg`,
      `Chest/Bust: ${profile.chest} cm  |  Waist: ${profile.waist} cm  |  Hip: ${profile.hip} cm`,
    ];

    if (result.photoInsights) {
      lines.push('');
      lines.push('BODY PHOTO PROPORTION ANALYSIS');
      lines.push(`Visual Waist-to-Hip Ratio: ${result.photoInsights.visualWaistToHip}`);
      lines.push(`Visual Fit Structure: ${result.photoInsights.visualFitAdjustment}`);
      lines.push(`Measurement Alignment Score: ${result.photoInsights.alignmentScore}%`);
      lines.push(result.photoInsights.comparisonNote);
    }

    lines.push('');
    lines.push('PERSONALIZED RECOMMENDATIONS');
    lines.push(...result.styles.map((style) => `• ${style}`));
    lines.push('');
    lines.push(result.explanation);

    lines.forEach((line) => {
      if (
        line === 'MEASUREMENT & PROFILE SUMMARY' ||
        line === 'BODY PHOTO PROPORTION ANALYSIS' ||
        line === 'PERSONALIZED RECOMMENDATIONS'
      ) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      pdf.text(line, 16, y);
      y += 8;
    });

    pdf.setFontSize(8);
    pdf.setTextColor(110, 120, 120);
    pdf.text(
      'Sizing is an intelligent estimate based on entered measurements and optional body proportions. Gender is user-controlled.',
      16,
      285
    );
    pdf.save('smart-dress-size-report.pdf');
  };

  const chart = SIZE_CHARTS[chartTab];

  return (
    <div className="smart-size-studio">
      {/* ── Hero Banner ────────────────────────────────── */}
      <section className="smart-hero">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> Intelligent fit lab
          </span>
          <h1>Find the size that feels like you.</h1>
          <p>
            Combine your body measurements with optional automated photo proportion analysis to
            discover your ideal fit and dress recommendations.
          </p>
        </div>
        <div className="hero-tools">
          <button
            type="button"
            className="theme-button"
            title="Toggle dark mode"
            onClick={() => setIsDark((curr) => !curr)}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="hero-stat">
            <strong>{result ? `${result.confidence}%` : '—'}</strong>
            <span>confidence</span>
          </div>
        </div>
      </section>

      <div className="smart-layout">
        {/* ── Left Column: Form & Photo Upload ────────── */}
        <section className="smart-form-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">01 / Profile</span>
              <h2>Your measurements</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              title="Reset form"
              onClick={() => {
                setProfile(initialProfile(measurements));
                setResult(null);
                setErrors([]);
                handleRemovePhoto();
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="smart-fields">
            {/* Gender Field: User-controlled */}
            <label>
              Gender
              <select
                value={profile.gender}
                onChange={(e) => updateProfile('gender', e.target.value as Gender)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
            <label>
              Age
              <input
                type="number"
                min="3"
                max="100"
                value={profile.age}
                onChange={(e) => updateProfile('age', Number(e.target.value))}
              />
            </label>
            <label>
              Height <span>(cm)</span>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => updateProfile('height', Number(e.target.value))}
              />
            </label>
            <label>
              Weight <span>(kg)</span>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => updateProfile('weight', Number(e.target.value))}
              />
            </label>
            <label>
              Chest / bust <span>(cm)</span>
              <input
                type="number"
                value={profile.chest}
                onChange={(e) => updateProfile('chest', Number(e.target.value))}
              />
            </label>
            <label>
              Waist <span>(cm)</span>
              <input
                type="number"
                value={profile.waist}
                onChange={(e) => updateProfile('waist', Number(e.target.value))}
              />
            </label>
            <label>
              Hip <span>(cm)</span>
              <input
                type="number"
                value={profile.hip}
                onChange={(e) => updateProfile('hip', Number(e.target.value))}
              />
            </label>
          </div>

          <fieldset className="fit-fieldset">
            <legend>Preferred fit</legend>
            <div className="fit-options">
              {(['Slim', 'Regular', 'Loose'] as FitPreference[]).map((fit) => (
                <button
                  type="button"
                  key={fit}
                  className={profile.fit === fit ? 'selected' : ''}
                  onClick={() => updateProfile('fit', fit)}
                >
                  {fit}
                  <small>
                    {fit === 'Slim'
                      ? 'Close to body'
                      : fit === 'Loose'
                      ? 'More room'
                      : 'Balanced ease'}
                  </small>
                </button>
              ))}
            </div>
          </fieldset>

          {errors.length > 0 && (
            <div className="form-errors" role="alert">
              {errors.map((err) => (
                <span key={err}>{err}</span>
              ))}
            </div>
          )}

          <button
            type="button"
            className="primary-action"
            onClick={runAnalysis}
            disabled={isAnalyzing || photoAnalysisStep === 'uploading' || photoAnalysisStep === 'analyzing'}
          >
            {isAnalyzing ? (
              <>
                <Activity className="spin" size={18} /> Analyzing profile...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze my size
              </>
            )}
          </button>

          {/* ── Upgraded Optional Body Image Upload Block ── */}
          <div className="photo-upload-container">
            <div className="upload-header">
              <div>
                <span className="section-kicker">Optional Body Image Upload</span>
                <p className="upload-subtitle">
                  Automatic AI body proportion &amp; visual fit analysis.
                </p>
              </div>
              <div className="privacy-badge" title="Photo analysis never infers gender. Gender remains user-controlled.">
                <ShieldCheck size={14} /> <span>Gender Private</span>
              </div>
            </div>

            {/* Error Message Alert Banner */}
            {photoAnalysisStep === 'error' && photoError && (
              <div className="photo-error-banner" role="alert">
                <AlertCircle size={18} className="error-icon" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Image Upload Area & Preview */}
            {!imageUrl ? (
              <div
                className="photo-dropzone"
                ref={dropZoneRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  processImageUpload(e.dataTransfer.files?.[0]);
                }}
              >
                <input
                  type="file"
                  id="body-photo-input"
                  accept="image/*"
                  onChange={(e) => processImageUpload(e.target.files?.[0])}
                />
                <label htmlFor="body-photo-input" className="photo-dropzone-label">
                  <div className="upload-icon-circle">
                    <Upload size={20} />
                  </div>
                  <div>
                    <strong>Upload Body Photo</strong>
                    <span>Click or drag full-body photo for auto-analysis</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="photo-analysis-box">
                {/* Photo Preview Card with Scanner & Overlay */}
                <div className="photo-preview-wrapper">
                  <img src={imageUrl} alt="Uploaded body photo" className="body-photo-img" />

                  {/* Animated Scanner Bar during analysis */}
                  {(photoAnalysisStep === 'uploading' || photoAnalysisStep === 'analyzing' || photoAnalysisStep === 'recommendations') && (
                    <div className="scanner-line-bar" />
                  )}

                  {/* Body Landmark Visualization Overlay */}
                  {photoAnalysisStep === 'complete' && photoLandmarks && showLandmarkOverlay && (
                    <svg className="landmark-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Shoulder line */}
                      <line
                        x1={photoLandmarks.landmarks.leftShoulder.x}
                        y1={photoLandmarks.landmarks.leftShoulder.y}
                        x2={photoLandmarks.landmarks.rightShoulder.x}
                        y2={photoLandmarks.landmarks.rightShoulder.y}
                        className="landmark-line shoulder-line"
                      />
                      {/* Bust guide */}
                      <line x1="25" y1={photoLandmarks.landmarks.bustLine.y} x2="75" y2={photoLandmarks.landmarks.bustLine.y} className="landmark-guide-line" />
                      {/* Waist guide */}
                      <line x1="28" y1={photoLandmarks.landmarks.waistLine.y} x2="72" y2={photoLandmarks.landmarks.waistLine.y} className="landmark-guide-line waist-guide" />
                      {/* Hip guide */}
                      <line x1="26" y1={photoLandmarks.landmarks.hipLine.y} x2="74" y2={photoLandmarks.landmarks.hipLine.y} className="landmark-guide-line" />
                      {/* Spine / Alignment axis */}
                      <line
                        x1={photoLandmarks.landmarks.head.x}
                        y1={photoLandmarks.landmarks.head.y}
                        x2={photoLandmarks.landmarks.head.x}
                        y2={photoLandmarks.landmarks.hipLine.y}
                        className="landmark-spine-line"
                      />
                      {/* Keypoint Dots */}
                      <circle cx={photoLandmarks.landmarks.leftShoulder.x} cy={photoLandmarks.landmarks.leftShoulder.y} r="2.5" className="keypoint-dot" />
                      <circle cx={photoLandmarks.landmarks.rightShoulder.x} cy={photoLandmarks.landmarks.rightShoulder.y} r="2.5" className="keypoint-dot" />
                      <circle cx={photoLandmarks.landmarks.bustLine.x} cy={photoLandmarks.landmarks.bustLine.y} r="2" className="keypoint-dot sub" />
                      <circle cx={photoLandmarks.landmarks.waistLine.x} cy={photoLandmarks.landmarks.waistLine.y} r="2" className="keypoint-dot sub" />
                      <circle cx={photoLandmarks.landmarks.hipLine.x} cy={photoLandmarks.landmarks.hipLine.y} r="2" className="keypoint-dot sub" />
                    </svg>
                  )}

                  {/* Overlay Controls */}
                  <div className="preview-top-actions">
                    {photoAnalysisStep === 'complete' && (
                      <button
                        type="button"
                        className="overlay-toggle-btn"
                        title={showLandmarkOverlay ? 'Hide Landmarks' : 'Show Landmarks'}
                        onClick={() => setShowLandmarkOverlay(!showLandmarkOverlay)}
                      >
                        {showLandmarkOverlay ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                    <button
                      type="button"
                      className="photo-remove-btn"
                      title="Remove image"
                      onClick={handleRemovePhoto}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Analysis Loading Animation Stepper */}
                {(photoAnalysisStep === 'uploading' ||
                  photoAnalysisStep === 'analyzing' ||
                  photoAnalysisStep === 'recommendations') && (
                  <div className="photo-loading-stepper">
                    <div className="stepper-header">
                      <Activity className="spin text-accent" size={16} />
                      <strong>Analyzing body proportions...</strong>
                    </div>
                    <div className="stepper-progress-bar">
                      <div className="stepper-progress-fill" style={{ width: `${photoProgress}%` }} />
                    </div>
                    <ul className="stepper-steps-list">
                      <li className={photoAnalysisStep === 'uploading' ? 'active' : 'done'}>
                        Uploading Photo
                      </li>
                      <li className={photoAnalysisStep === 'analyzing' ? 'active' : photoAnalysisStep === 'recommendations' ? 'done' : ''}>
                        Analyzing Proportions
                      </li>
                      <li className={photoAnalysisStep === 'recommendations' ? 'active' : ''}>
                        Generating Fit Recommendations
                      </li>
                      <li>Complete</li>
                    </ul>
                  </div>
                )}

                {/* Photo Analysis Ready Success Banner */}
                {photoAnalysisStep === 'complete' && photoLandmarks && (
                  <div className="photo-success-card">
                    <div className="success-header">
                      <CheckCircle2 size={18} className="success-icon" />
                      <div>
                        <strong>Photo Analysis Ready</strong>
                        <p>Proportions and visual fit integrated automatically.</p>
                      </div>
                    </div>
                    <div className="landmarks-summary-grid">
                      <div className="landmark-metric-chip">
                        <span>Waist-to-Hip Ratio</span>
                        <strong>{photoLandmarks.waistToHipRatio}</strong>
                      </div>
                      <div className="landmark-metric-chip">
                        <span>Visual Structure</span>
                        <strong>{photoLandmarks.visualFitAdjustment}</strong>
                      </div>
                      <div className="landmark-metric-chip">
                        <span>Posture Symmetry</span>
                        <strong>{photoLandmarks.symmetryScore}%</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Right Column: Results & Recommendations ───── */}
        <section className="results-column">
          {result ? (
            <>
              <div className="result-grid">
                <article className="result-card size-result">
                  <span className="card-label">Recommended size</span>
                  <strong>{result.size}</strong>
                  <div className="confidence-line">
                    <span>Confidence</span>
                    <b>{result.confidence}%</b>
                  </div>
                  <div className="progress">
                    <i style={{ width: `${result.confidence}%` }} />
                  </div>
                </article>

                <article className="result-card">
                  <span className="card-label">Body shape</span>
                  <strong className="result-title">{result.bodyShape}</strong>
                  <p>{result.shapeExplanation}</p>
                </article>

                <article className="result-card">
                  <span className="card-label">BMI snapshot</span>
                  <strong className="result-title">{result.bmi}</strong>
                  <p>
                    {result.bmiCategory}. BMI is a general calculation, not a complete health
                    assessment.
                  </p>
                </article>

                <article className="result-card">
                  <span className="card-label">Suggested fit</span>
                  <strong className="result-title">{result.fit}</strong>
                  <p>
                    Built around your comfort preference and the balance of all key measurements.
                  </p>
                </article>
              </div>

              {/* Photo Analysis Insights Box if available */}
              {result.photoInsights && (
                <div className="photo-insights-banner">
                  <div className="insights-heading">
                    <Sparkles size={16} />
                    <strong>Photo Analysis &amp; Visual Fit Match</strong>
                  </div>
                  <p>{result.photoInsights.comparisonNote}</p>
                </div>
              )}

              <div className="explanation-panel">
                <span className="section-kicker">Why this result</span>
                <p>{result.explanation}</p>
                <button type="button" className="secondary-action" onClick={downloadReport}>
                  <Download size={16} /> Download My Size Report
                </button>
              </div>

              <div className="recommendations-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">03 / Style direction</span>
                    <h2>Personalized recommendations</h2>
                  </div>
                </div>
                <div className="recommendation-list">
                  {result.styles.map((style, index) => (
                    <article key={style}>
                      <span>0{index + 1}</span>
                      <div>
                        <strong>{style}</strong>
                        <p>
                          Selected for your {result.bodyShape.toLowerCase()} profile and{' '}
                          {result.fit.toLowerCase()} preference.
                        </p>
                      </div>
                      <Check size={17} />
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-result">
              <Sparkles size={26} />
              <h2>Your fit profile is ready to discover.</h2>
              <p>
                Complete the measurements or upload a body photo to automatically generate your size
                recommendation, body shape, and style direction.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Reference Size Charts ─────────────────────── */}
      <section className="size-chart-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">04 / Reference</span>
            <h2>Interactive size chart</h2>
          </div>
          <div className="chart-tabs">
            {(['Women', 'Men', 'Kids'] as const).map((tab) => (
              <button
                type="button"
                className={chartTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setChartTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest / bust</th>
                <th>Waist</th>
                <th>Hip</th>
                <th>Height range</th>
              </tr>
            </thead>
            <tbody>
              {chart.map((row) => (
                <tr
                  className={result?.size === row.size ? 'highlight-row' : ''}
                  key={row.size}
                >
                  <td>
                    <strong>{row.size}</strong>
                    {result?.size === row.size && <em>Your size</em>}
                  </td>
                  <td>
                    {row.chest[0]}–{row.chest[1]} cm
                  </td>
                  <td>
                    {row.waist[0]}–{row.waist[1]} cm
                  </td>
                  <td>
                    {row.hip[0]}–{row.hip[1]} cm
                  </td>
                  <td>
                    {row.height[0]}–{row.height[1]} cm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Calculation History ───────────────────────── */}
      <section className="history-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              <History size={14} /> Saved locally
            </span>
            <h2>Calculation history</h2>
          </div>
          {history.length > 0 && (
            <button type="button" className="text-action" onClick={() => persistHistory([])}>
              Clear all
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="muted-copy">Your analyzed profiles will appear here for quick reference.</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>
                    {item.result.size} / {item.result.bodyShape}
                  </strong>
                  <span>
                    {new Date(item.createdAt).toLocaleString()} · {item.profile.gender} ·{' '}
                    {item.profile.height} cm
                  </span>
                </div>
                <button type="button" className="text-action" onClick={() => loadHistory(item)}>
                  Load
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  title="Delete calculation"
                  onClick={() => persistHistory(history.filter((entry) => entry.id !== item.id))}
                >
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="info-panel">
        <div className="info-icon">
          <Camera size={20} />
        </div>
        <div>
          <h2>AI-Based Smart Dress Size &amp; Photo Analysis System</h2>
          <p>
            Combines user-controlled gender choices, precise body measurements, and optional automatic
            body proportion photo analysis to deliver personalized fit and clothing recommendations.
          </p>
          <div className="workflow">
            User Measurements <b>→</b> Photo Upload <b>→</b> Auto Analysis <b>→</b> Landmarks &amp; Proportions <b>→</b> Smart Size <b>→</b> Dynamic Recommendations
          </div>
        </div>
      </section>
    </div>
  );
};

export default SmartSizeStudio;
