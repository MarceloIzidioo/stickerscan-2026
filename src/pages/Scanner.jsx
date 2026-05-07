import { useState, useRef, useEffect, useCallback } from 'react';
import { recognizeStickerFromImage } from '../services/stickerRecognitionService';
import { addSticker, getCollection, markScannerUsed } from '../services/collectionService';
import { getStickerStatus, getStatusLabel, TEAM_FLAGS } from '../utils/statusUtils';
import Toast from '../components/Toast';

export default function Scanner() {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [collection, setCollection] = useState({});
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    setCollection(getCollection());
  }, []);

  // Set the video source whenever the stream or component mounts
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  // Função antiga mantida como fallback (upload de arquivo)
  const handleCapture = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setResult(null);

    const imageUrl = URL.createObjectURL(file);
    setCapturedImage(imageUrl);

    try {
      const scanResult = await recognizeStickerFromImage(imageUrl);
      markScannerUsed();
      setResult(scanResult);
    } catch (e) {
      setResult({ error: e.message || 'Erro ao analisar a imagem' });
    }
    setScanning(false);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  // Ativar Câmera ao vivo
  const startCamera = async () => {
    try {
      // Tenta abrir a câmera traseira (ideal)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
      } catch (err) {
        // Se falhar, tenta qualquer câmera disponível
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      setCameraStream(stream);
      setIsCameraActive(true);
      setResult(null);
      setCapturedImage(null);
    } catch (err) {
      console.error("Erro ao acessar câmera ao vivo:", err);
      setToast({ show: true, message: '⚠️ Câmera ao vivo indisponível. Abrindo nativa.' });
      // Fallback para input normal
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      const tracks = cameraStream.getTracks();
      tracks.forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setIsCameraActive(false);
  };

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurar canvas com o mesmo tamanho do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Pegar frame como base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    stopCamera();
    setCapturedImage(imageData);
    setScanning(true);
    
    try {
      const scanResult = await recognizeStickerFromImage(imageData);
      markScannerUsed();
      setResult(scanResult);
    } catch (e) {
      setResult({ error: e.message || 'Erro ao analisar a imagem' });
    }
    setScanning(false);
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Cleanup camera and object URL when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
      // Não damos revokeObjectURL para data URIs
      if (capturedImage && capturedImage.startsWith('blob:')) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  // Add to collection
  const handleAddToCollection = () => {
    if (!result?.match) return;
    const updated = addSticker(result.match.id);
    setCollection({ ...updated });
    const qty = updated[result.match.id] || 0;
    if (qty === 1) {
      setToast({ show: true, message: `✅ Nova figurinha adicionada! ${result.match.nome}` });
    } else {
      setToast({ show: true, message: `🔄 ${result.match.nome} - Agora com ${qty} unidades` });
    }
    setResult(null);
    setCapturedImage(null);
  };

  const qty = result?.match ? (collection[result.match.id] || 0) : 0;
  const status = result?.match ? getStickerStatus(qty) : null;

  return (
    <div style={{ paddingBottom: 20, textAlign: 'center' }}>
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 20,
        fontWeight: 800,
        color: '#f1f5f9',
        marginBottom: 6,
      }}>
        📸 Scanner de Figurinhas
      </h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
        Tire uma foto da figurinha para identificá-la.
      </p>

      {/* Hidden file input for camera access */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCapture}
        style={{ display: 'none' }}
      />

      {/* Canvas escondido para capturar o frame */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}>
        {isCameraActive && (
          <div style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 16,
            overflow: 'hidden',
            border: '2px solid rgba(212,175,55,0.4)',
            background: '#000',
            position: 'relative'
          }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              onLoadedMetadata={() => videoRef.current.play()}
              style={{ width: '100%', display: 'block' }}
            />
            {/* Guide frame para posicionar a figurinha */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '70%',
              border: '2px dashed rgba(255,255,255,0.6)',
              borderRadius: 8,
              pointerEvents: 'none'
            }} />
          </div>
        )}

        {isCameraActive ? (
          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 300, marginTop: 10 }}>
            <button
              onClick={takeSnapshot}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #d4af37, #b8941e)',
                color: '#000',
                fontSize: 16,
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
              }}
            >
              📸 Tirar Foto
            </button>
            <button
              onClick={stopCamera}
              style={{
                padding: '16px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e2e8f0',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        ) : !capturedImage && !scanning && (
          <>
            <button
              onClick={startCamera}
              style={{
                padding: '24px 32px',
                borderRadius: 20,
                border: '2px dashed rgba(212,175,55,0.4)',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(0,166,81,0.05))',
                color: '#d4af37',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                maxWidth: 300,
              }}
            >
              <span style={{ fontSize: 48 }}>📷</span>
              Abrir Câmera no App
            </button>
            
            <button
              onClick={triggerCamera}
              style={{
                fontSize: 13,
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                marginTop: 8,
                cursor: 'pointer',
              }}
            >
              Ou escolher arquivo / câmera nativa
            </button>
          </>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card" style={{
          marginTop: 20,
          padding: 20,
          maxWidth: 380,
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'left',
          animation: 'slideUp 0.3s ease'
        }}>
          {result.error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>❌</div>
              <h3 style={{ color: '#ef4444', marginBottom: 8 }}>Erro no Reconhecimento</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>{result.error}</p>
              <button
                onClick={() => { setResult(null); setCapturedImage(null); }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              <div style={{
                textAlign: 'center',
                marginBottom: 14,
              }}>
            <span style={{
              fontSize: 13,
              color: '#4ade80',
              fontWeight: 600,
            }}>
              ✅ Figurinha identificada!
            </span>
          </div>

          {/* Captured image */}
          {capturedImage && (
            <div style={{
              width: '100%',
              height: 200,
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 14,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <img
                src={capturedImage}
                alt="Captura"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Sticker info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(0,166,81,0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}>
              {TEAM_FLAGS[result.match.selecao] || '⚽'}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{result.match.numero}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{result.match.nome}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {result.match.selecao} {result.match.clube ? `• ${result.match.clube}` : ''}
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `3px solid ${result.confidence >= 0.9 ? '#4ade80' : '#facc15'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: result.confidence >= 0.9 ? '#4ade80' : '#facc15',
            }}>
              {Math.round(result.confidence * 100)}%
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Confiança simulada</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                OCR: {result.signals.ocrNumber} | Visual: {Math.round(result.signals.visualSimilarity * 100)}%
              </div>
            </div>
          </div>

          {/* Current status */}
          {qty > 0 && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 10,
              background: status === 'repetida' ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${status === 'repetida' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)'}`,
              fontSize: 13,
              color: status === 'repetida' ? '#facc15' : '#4ade80',
              marginBottom: 14,
              textAlign: 'center',
            }}>
              {status === 'repetida'
                ? `Essa você já tem (${qty}x). Bora marcar como repetida?`
                : 'Essa você já tem! Deseja adicionar mais uma?'}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAddToCollection}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #d4af37, #b8941e)',
                color: '#000',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
              }}
            >
              {qty > 0 ? '🔄 +1 Repetida' : '✅ Adicionar'}
            </button>
            <button
              onClick={() => { setResult(null); setCapturedImage(null); }}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Voltar
            </button>
          </div>
          </>
        )}
        </div>
      )}

      {/* Scanning indicator */}
      {scanning && !result && (
        <div style={{
          marginTop: 40,
          textAlign: 'center',
          color: '#d4af37',
          fontSize: 14,
          fontWeight: 500,
        }}>
          {capturedImage && (
              <div style={{
                  width: '100%',
                  maxWidth: 200,
                  height: 200,
                  margin: '0 auto 20px',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '2px solid rgba(212,175,55,0.5)',
                  position: 'relative'
              }}>
                  <img src={capturedImage} alt="Scanning" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                  <div className="scan-line" style={{ display: 'block', left: 0, right: 0 }} />
              </div>
          )}
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'pulseRing 1.5s infinite' }}>🔍</div>
          Analisando figurinha...
        </div>
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}
