import React, { useEffect, useState } from 'react';
import { Activity, Camera, Check, Download, History, Moon, RotateCcw, Sparkles, Sun, Trash2, Upload, X } from 'lucide-react';
import jsPDF from 'jspdf';
import type { Gender, Measurements } from '../types';
import { inchToCm, cmToInch } from '../utils/unitConversion';
import { calculateSmartRecommendation, SIZE_CHARTS, type FitPreference, type SmartProfile, type SmartRecommendation } from '../utils/smartRecommendation';
import './SmartSizeStudio.css';

interface HistoryItem { id: string; createdAt: string; profile: SmartProfile; result: SmartRecommendation; }
interface SmartSizeStudioProps { measurements: Measurements; onMeasurementsChange: (measurements: Measurements) => void; }

const initialProfile = (m: Measurements): SmartProfile => ({
  gender: m.gender === 'kids' ? 'kids' : m.gender || 'female', age: m.age || 26, height: m.height || 165, weight: m.weight || 62,
  chest: inchToCm(m.bust || 38), waist: inchToCm(m.waist || 32), hip: inchToCm(m.hip || 40), fit: 'Regular',
});

const SmartSizeStudio: React.FC<SmartSizeStudioProps> = ({ measurements, onMeasurementsChange }) => {
  const [profile, setProfile] = useState<SmartProfile>(() => initialProfile(measurements));
  const [result, setResult] = useState<SmartRecommendation | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => JSON.parse(localStorage.getItem('smarttailor-size-history') || '[]') as HistoryItem[]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState<'Men' | 'Women' | 'Kids'>('Women');
  const [errors, setErrors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('smarttailor-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDark);
    localStorage.setItem('smarttailor-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const updateProfile = <K extends keyof SmartProfile>(key: K, value: SmartProfile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const persistHistory = (items: HistoryItem[]) => { setHistory(items); localStorage.setItem('smarttailor-size-history', JSON.stringify(items)); };
  const runAnalysis = () => {
    const nextErrors: string[] = [];
    if (profile.age < 3 || profile.age > 100) nextErrors.push('Age must be between 3 and 100.');
    if (profile.height < 80 || profile.height > 230) nextErrors.push('Height must be between 80 and 230 cm.');
    if (profile.weight < 10 || profile.weight > 250) nextErrors.push('Weight must be between 10 and 250 kg.');
    if ([profile.chest, profile.waist, profile.hip].some((value) => value < 40 || value > 180)) nextErrors.push('Measurements must be between 40 and 180 cm.');
    setErrors(nextErrors);
    if (nextErrors.length) return;
    setIsAnalyzing(true);
    window.setTimeout(() => {
      const nextResult = calculateSmartRecommendation(profile);
      setResult(nextResult);
      const item = { id: String(Date.now()), createdAt: new Date().toISOString(), profile, result: nextResult };
      persistHistory([item, ...history].slice(0, 12));
      onMeasurementsChange({ ...measurements, gender: profile.gender, age: profile.age, height: profile.height, weight: profile.weight, bust: cmToInch(profile.chest), waist: cmToInch(profile.waist), hip: cmToInch(profile.hip), dressSize: nextResult.size === 'XXL' ? 50 : nextResult.size === 'XL' ? 46 : nextResult.size === 'L' ? 42 : nextResult.size === 'M' ? 38 : nextResult.size === 'S' ? 34 : 32 });
      setIsAnalyzing(false);
    }, 500);
  };
  const loadHistory = (item: HistoryItem) => { setProfile(item.profile); setResult(item.result); setErrors([]); };
  const handleImage = (file?: File) => { if (!file) return; if (!file.type.startsWith('image/')) { setErrors(['Please choose an image file.']); return; } setImageUrl(URL.createObjectURL(file)); };
  const downloadReport = () => {
    if (!result) return;
    const pdf = new jsPDF();
    pdf.setFillColor(19, 51, 54); pdf.rect(0, 0, 210, 34, 'F'); pdf.setTextColor(255, 255, 255); pdf.setFontSize(18); pdf.text('AI-Based Smart Dress Size Report', 16, 20);
    pdf.setTextColor(35, 45, 48); pdf.setFontSize(11); let y = 48;
    const lines = [`Generated: ${new Date().toLocaleString()}`, `Recommended size: ${result.size}  |  Confidence: ${result.confidence}%`, `Body shape: ${result.bodyShape}`, `BMI: ${result.bmi} (${result.bmiCategory})`, `Fit preference: ${result.fit}`, '', 'MEASUREMENT SUMMARY', `Gender: ${profile.gender}  |  Age: ${profile.age}`, `Height: ${profile.height} cm  |  Weight: ${profile.weight} kg`, `Chest/Bust: ${profile.chest} cm  |  Waist: ${profile.waist} cm  |  Hip: ${profile.hip} cm`, '', 'PERSONALIZED RECOMMENDATIONS', ...result.styles.map((style) => `• ${style}`), '', result.explanation];
    lines.forEach((line) => { if (line === 'MEASUREMENT SUMMARY' || line === 'PERSONALIZED RECOMMENDATIONS') pdf.setFont('helvetica', 'bold'); else pdf.setFont('helvetica', 'normal'); pdf.text(line, 16, y); y += 8; });
    pdf.setFontSize(8); pdf.setTextColor(110, 120, 120); pdf.text('Sizing is an intelligent estimate based on the entered measurements. BMI is a general calculation, not a complete health assessment.', 16, 285);
    pdf.save('smart-dress-size-report.pdf');
  };

  const chart = SIZE_CHARTS[chartTab];
  return <div className="smart-size-studio">
    <section className="smart-hero"><div><span className="eyebrow"><Sparkles size={14} /> Intelligent fit lab</span><h1>Find the size that feels like you.</h1><p>Use a few body measurements to create a considered size, shape, and style recommendation. Everything runs locally in your browser.</p></div><div className="hero-tools"><button type="button" className="theme-button" title="Toggle dark mode" onClick={() => setIsDark((current) => !current)}>{isDark ? <Sun size={16} /> : <Moon size={16} />}</button><div className="hero-stat"><strong>{result ? `${result.confidence}%` : '—'}</strong><span>confidence</span></div></div></section>
    <div className="smart-layout">
      <section className="smart-form-panel"><div className="section-heading"><div><span className="section-kicker">01 / Profile</span><h2>Your measurements</h2></div><button type="button" className="icon-button" title="Reset form" onClick={() => { setProfile(initialProfile(measurements)); setResult(null); setErrors([]); }}><RotateCcw size={16} /></button></div>
        <div className="smart-fields">
          <label>Gender<select value={profile.gender} onChange={(e) => updateProfile('gender', e.target.value as Gender)}><option value="female">Female</option><option value="male">Male</option><option value="kids">Kids</option></select></label>
          <label>Age<input type="number" min="3" max="100" value={profile.age} onChange={(e) => updateProfile('age', Number(e.target.value))} /></label>
          <label>Height <span>(cm)</span><input type="number" value={profile.height} onChange={(e) => updateProfile('height', Number(e.target.value))} /></label>
          <label>Weight <span>(kg)</span><input type="number" value={profile.weight} onChange={(e) => updateProfile('weight', Number(e.target.value))} /></label>
          <label>Chest / bust <span>(cm)</span><input type="number" value={profile.chest} onChange={(e) => updateProfile('chest', Number(e.target.value))} /></label>
          <label>Waist <span>(cm)</span><input type="number" value={profile.waist} onChange={(e) => updateProfile('waist', Number(e.target.value))} /></label>
          <label>Hip <span>(cm)</span><input type="number" value={profile.hip} onChange={(e) => updateProfile('hip', Number(e.target.value))} /></label>
        </div>
        <fieldset className="fit-fieldset"><legend>Preferred fit</legend><div className="fit-options">{(['Slim', 'Regular', 'Loose'] as FitPreference[]).map((fit) => <button type="button" key={fit} className={profile.fit === fit ? 'selected' : ''} onClick={() => updateProfile('fit', fit)}>{fit}<small>{fit === 'Slim' ? 'Close to body' : fit === 'Loose' ? 'More room' : 'Balanced ease'}</small></button>)}</div></fieldset>
        {errors.length > 0 && <div className="form-errors" role="alert">{errors.map((error) => <span key={error}>{error}</span>)}</div>}
        <button type="button" className="primary-action" onClick={runAnalysis} disabled={isAnalyzing}>{isAnalyzing ? <><Activity className="spin" size={18} /> Analyzing profile...</> : <><Sparkles size={18} /> Analyze my size</>}</button>
        <div className="upload-block"><div><span className="section-kicker">Optional body image upload</span><p>Preview only for future AI analysis. It does not measure your body.</p></div>{imageUrl ? <div className="image-preview"><img src={imageUrl} alt="Uploaded body preview" /><button type="button" title="Remove image" onClick={() => setImageUrl(null)}><X size={15} /></button></div> : <label className="upload-button"><Upload size={17} /> Add image<input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} /></label>}</div>
      </section>
      <section className="results-column">{result ? <><div className="result-grid"><article className="result-card size-result"><span className="card-label">Recommended size</span><strong>{result.size}</strong><div className="confidence-line"><span>Confidence</span><b>{result.confidence}%</b></div><div className="progress"><i style={{ width: `${result.confidence}%` }} /></div></article><article className="result-card"><span className="card-label">Body shape</span><strong className="result-title">{result.bodyShape}</strong><p>{result.shapeExplanation}</p></article><article className="result-card"><span className="card-label">BMI snapshot</span><strong className="result-title">{result.bmi}</strong><p>{result.bmiCategory}. BMI is a general calculation, not a complete health assessment.</p></article><article className="result-card"><span className="card-label">Suggested fit</span><strong className="result-title">{result.fit}</strong><p>Built around your comfort preference and the balance of all three key measurements.</p></article></div><div className="explanation-panel"><span className="section-kicker">Why this result</span><p>{result.explanation}</p><button type="button" className="secondary-action" onClick={downloadReport}><Download size={16} /> Download My Size Report</button></div><div className="recommendations-panel"><div className="section-heading"><div><span className="section-kicker">03 / Style direction</span><h2>Personalized recommendations</h2></div></div><div className="recommendation-list">{result.styles.map((style, index) => <article key={style}><span>0{index + 1}</span><div><strong>{style}</strong><p>Selected for your {result.bodyShape.toLowerCase()} profile and {result.fit.toLowerCase()} preference.</p></div><Check size={17} /></article>)}</div></div></> : <div className="empty-result"><Sparkles size={26} /><h2>Your fit profile is ready to discover.</h2><p>Complete the measurements and run the analysis to see your recommended size, body shape, BMI, and style direction.</p></div>}</section>
    </div>
    <section className="size-chart-panel"><div className="section-heading"><div><span className="section-kicker">04 / Reference</span><h2>Interactive size chart</h2></div><div className="chart-tabs">{(['Women', 'Men', 'Kids'] as const).map((tab) => <button type="button" className={chartTab === tab ? 'active' : ''} key={tab} onClick={() => setChartTab(tab)}>{tab}</button>)}</div></div><div className="table-scroll"><table><thead><tr><th>Size</th><th>Chest / bust</th><th>Waist</th><th>Hip</th><th>Height range</th></tr></thead><tbody>{chart.map((row) => <tr className={result?.size === row.size ? 'highlight-row' : ''} key={row.size}><td><strong>{row.size}</strong>{result?.size === row.size && <em>Your size</em>}</td><td>{row.chest[0]}–{row.chest[1]} cm</td><td>{row.waist[0]}–{row.waist[1]} cm</td><td>{row.hip[0]}–{row.hip[1]} cm</td><td>{row.height[0]}–{row.height[1]} cm</td></tr>)}</tbody></table></div></section>
    <section className="history-panel"><div className="section-heading"><div><span className="section-kicker"><History size={14} /> Saved locally</span><h2>Calculation history</h2></div>{history.length > 0 && <button type="button" className="text-action" onClick={() => persistHistory([])}>Clear all</button>}</div>{history.length === 0 ? <p className="muted-copy">Your analyzed profiles will appear here for quick reference.</p> : <div className="history-list">{history.map((item) => <article key={item.id}><div><strong>{item.result.size} / {item.result.bodyShape}</strong><span>{new Date(item.createdAt).toLocaleString()} · {item.profile.gender} · {item.profile.height} cm</span></div><button type="button" className="text-action" onClick={() => loadHistory(item)}>Load</button><button type="button" className="icon-button danger" title="Delete calculation" onClick={() => persistHistory(history.filter((entry) => entry.id !== item.id))}><Trash2 size={15} /></button></article>)}</div>}</section>
    <section className="info-panel"><div className="info-icon"><Camera size={20} /></div><div><h2>AI-Based Smart Dress Size Recommendation System</h2><p>This system uses body measurements, BMI, body shape analysis, and intelligent recommendation logic to suggest a suitable dress size and personalized clothing recommendations.</p><div className="workflow">User Measurements <b>→</b> Validation <b>→</b> BMI <b>→</b> Body Shape <b>→</b> Smart Size <b>→</b> Style Recommendations</div></div></section>
  </div>;
};
export default SmartSizeStudio;
