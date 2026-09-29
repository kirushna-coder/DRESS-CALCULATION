// ============================================================
// Fabriplay AI – Photo Upload & Basic AI Analysis Module
// Interactive image upload, pose/person detection, gender-specific category suggestion & dress recommendations
// ============================================================

import React, { useState } from 'react';
import { Camera, Upload, Sparkles, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import type { DressType, Gender } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface PhotoAIAnalysisSectionProps {
  onApplyGarmentRecommendation: (dress: DressType) => void;
}

const SAMPLE_OUTFITS = [
  { id: 'sample-1', label: 'Casual Shirt Outfit (Male)', gender: 'male' as Gender, dress: 'SHIRT' as DressType, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80' },
  { id: 'sample-2', label: 'Summer Frock Outfit (Female)', gender: 'female' as Gender, dress: 'FROCK' as DressType, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&q=80' },
  { id: 'sample-3', label: 'Ethnic Kurta (Unisex)', gender: 'female' as Gender, dress: 'KURTA' as DressType, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&q=80' },
];

const PhotoAIAnalysisSection: React.FC<PhotoAIAnalysisSectionProps> = ({
  onApplyGarmentRecommendation,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(SAMPLE_OUTFITS[0].image);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    detectedPerson: boolean;
    detectedGender: Gender;
    suggestedCategories: string[];
    recommendedDresses: DressType[];
    confidence: number;
  } | null>({
    detectedPerson: true,
    detectedGender: 'male',
    suggestedCategories: ['Men - Shirts', 'Men - Trousers', 'General - Traditional Kurta'],
    recommendedDresses: ['SHIRT', 'PANT', 'KURTA'],
    confidence: 94,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
        runAnalysisSimulation('female');
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysisSimulation = (genderOverride?: Gender) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const isFemale = genderOverride === 'female';
      setAnalysisResult({
        detectedPerson: true,
        detectedGender: isFemale ? 'female' : 'male',
        suggestedCategories: isFemale
          ? ['Women - Frock / Dress', 'Women - Skirts', 'Women - Tops']
          : ['Men - Shirts', 'Men - Trousers', 'Men - Jackets'],
        recommendedDresses: isFemale ? ['FROCK', 'SKIRT', 'TOP'] : ['SHIRT', 'PANT', 'JACKET'],
        confidence: 96,
      });
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="photo-ai-analysis-card" id="step-ai-analysis">
      <div className="card-header-row">
        <div className="header-title-wrap">
          <div className="icon-badge rose">
            <Camera size={18} />
          </div>
          <div>
            <h2 className="card-title">Photo Upload &amp; AI Analysis</h2>
            <p className="card-sub">Upload full-length outfit photo to detect silhouette &amp; suggest garments</p>
          </div>
        </div>
        <span className="neural-tag">
          <Sparkles size={11} /> Vision AI
        </span>
      </div>

      <div className="photo-analysis-workflow-grid">
        {/* Left Column: Upload / Photo Selector */}
        <div className="photo-upload-col">
          <div className="dropzone-box">
            {selectedPhoto ? (
              <div className="photo-preview-wrap">
                <img src={selectedPhoto} alt="Uploaded silhouette preview" className="uploaded-img" />
                {isAnalyzing && (
                  <div className="scanner-line-overlay">
                    <div className="scanner-line"></div>
                    <span className="scanning-text">Analyzing silhouette keypoints...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-dropzone">
                <Upload size={32} className="upload-icon" />
                <span>Drag &amp; drop outfit photo here</span>
                <span className="sub-hint">or click to browse from device</span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="file-input-hidden"
              onChange={handleFileUpload}
              id="photo-upload-input"
            />
            <label htmlFor="photo-upload-input" className="btn-upload-trigger">
              <Upload size={14} /> Upload Custom Photo
            </label>
          </div>

          {/* Sample Pose Presets */}
          <div className="sample-poses-selector">
            <span className="sample-label">Or try with sample outfits:</span>
            <div className="sample-thumbs-row">
              {SAMPLE_OUTFITS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`thumb-btn ${selectedPhoto === item.image ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPhoto(item.image);
                    runAnalysisSimulation(item.gender);
                  }}
                >
                  <img src={item.image} alt={item.label} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result */}
        <div className="photo-results-col">
          {analysisResult && (
            <div className="ai-vision-results-box">
              <div className="vision-header">
                <UserCheck size={16} className="text-emerald" />
                <span>AI Vision Detection Result</span>
                <span className="confidence-pill">{analysisResult.confidence}% Match</span>
              </div>

              {/* Detected Person & Gender */}
              <div className="detection-status-row">
                <div className="status-badge">
                  <CheckCircle2 size={13} /> Visible Person Detected
                </div>
                <div className="gender-badge">
                  Gender Detected: <strong>{analysisResult.detectedGender.toUpperCase()}</strong>
                </div>
              </div>

              {/* Suggested Garment Categories */}
              <div className="suggested-categories-box">
                <span className="cat-header-label">Suggested Garment Categories:</span>
                <div className="cat-pills-wrap">
                  {analysisResult.suggestedCategories.map((cat, i) => (
                    <span key={i} className="cat-tag-pill">{cat}</span>
                  ))}
                </div>
              </div>

              {/* Recommended Dress Cards */}
              <div className="rec-dresses-box">
                <span className="cat-header-label">Garment Recommendations:</span>
                <div className="rec-dress-buttons-grid">
                  {analysisResult.recommendedDresses.map((dressKey) => {
                    const info = DRESS_TYPE_INFO[dressKey];
                    if (!info) return null;
                    return (
                      <button
                        key={dressKey}
                        type="button"
                        className="btn-apply-rec-dress"
                        onClick={() => onApplyGarmentRecommendation(dressKey)}
                      >
                        <span className="emoji">{info.icon}</span>
                        <span>{info.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Photo Analysis Disclaimer */}
      <div className="photo-disclaimer-box">
        <AlertCircle size={15} className="disclaimer-icon" />
        <p className="disclaimer-text">
          <strong>Photo Analysis Disclaimer:</strong> Photo analysis provides recommendations only.
          For accurate dress measurements, please enter body measurements manually.
        </p>
      </div>
    </div>
  );
};

export default PhotoAIAnalysisSection;
