import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode, Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import {
  X,
  RotateCw,
  Music2,
  Timer,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1.0 },
  { label: '2x', value: 2.0 },
  { label: '3x', value: 3.0 },
];

const TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '3s', value: 3 },
  { label: '10s', value: 10 },
];

export default function RecordScreen() {
  const router = useRouter();
  const { addVideo } = useApp();
  const [facing, setFacing] = useState('back' as CameraType);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUri, setVideoUri] = useState(null as string | null);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [selectedTimer, setSelectedTimer] = useState(0);
  const [countdown, setCountdown] = useState(null as number | null);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);

  const cameraRef = useRef(null as any);
  const recordingInterval = useRef(null as ReturnType<typeof setInterval> | null);
  const countdownInterval = useRef(null as ReturnType<typeof setInterval> | null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to record videos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const startCountdown = () => {
    if (selectedTimer === 0) {
      startRecording();
      return;
    }

    setCountdown(selectedTimer);
    let timeLeft = selectedTimer;

    countdownInterval.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }
        setCountdown(null);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    if (!cameraRef.current || Platform.OS === 'web') {
      Alert.alert('Recording', 'Recording is not available on web platform');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsRecording(true);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      if (video && video.uri) {
        setVideoUri(video.uri);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      stopRecording();
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;

    try {
      if (Platform.OS !== 'web') {
        await cameraRef.current.stopRecording();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }

    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const handleRecordButton = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startCountdown();
    }
  };

  const discardVideo = () => {
    setVideoUri(null);
    setRecordingTime(0);
  };

  const uploadVideo = () => {
    if (!videoUri) {
      Alert.alert('Error', 'No video to upload');
      return;
    }

    try {
      addVideo({
        videoUri,
        description: 'My new video 🎥 #fyp',
        music: {
          name: 'Original Sound',
          artist: 'You',
        },
      });

      Alert.alert('Success', 'Video posted successfully! Check your feed.', [
        {
          text: 'OK',
          onPress: () => {
            setVideoUri(null);
            setRecordingTime(0);
            router.push('/');
          },
        },
      ]);
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to post video. Please try again.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (videoUri) {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
        />

        <View style={styles.previewOverlay}>
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 20 }]} onPress={discardVideo}>
            <X size={28} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.discardButton} onPress={discardVideo}>
              <X size={24} color="#fff" strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={uploadVideo}>
              <LinearGradient
                colors={['#ff2e4c', '#ff6b8a']}
                style={styles.uploadButtonGradient}
              >
                <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>↑</Text>
                <Text style={styles.uploadButtonText}>Upload</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>
            Camera recording is not available on web.
            Please use the mobile app.
          </Text>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode="video">
          {countdown !== null && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.overlay}
          >
            <View style={[styles.topBar, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
                <X size={28} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.topActions}>
                <TouchableOpacity
                  style={styles.topButton}
                  onPress={() => setShowSpeedPicker(!showSpeedPicker)}
                >
                  <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>⚡</Text>
                  <Text style={styles.topButtonText}>{selectedSpeed}x</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
                  <RotateCw size={24} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.topButton}
                  onPress={() => setShowTimerPicker(!showTimerPicker)}
                >
                  <Timer size={24} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.topButtonText}>
                    {selectedTimer > 0 ? `${selectedTimer}s` : 'Off'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showSpeedPicker && (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Speed</Text>
                <View style={styles.pickerOptions}>
                  {SPEED_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        selectedSpeed === option.value && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedSpeed(option.value);
                        setShowSpeedPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedSpeed === option.value && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selectedSpeed === option.value && (
                        <Text style={{color: '#ff2e4c', fontSize: 16, fontWeight: 'bold'}}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {showTimerPicker && (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Timer</Text>
                <View style={styles.pickerOptions}>
                  {TIMER_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        selectedTimer === option.value && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedTimer(option.value);
                        setShowTimerPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedTimer === option.value && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selectedTimer === option.value && (
                        <Text style={{color: '#ff2e4c', fontSize: 16, fontWeight: 'bold'}}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.sideBar}>
              <TouchableOpacity style={styles.sideButton}>
                <Sparkles size={28} color="#fff" strokeWidth={2.5} />
                <Text style={styles.sideButtonText}>Effects</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideButton}>
                <Music2 size={28} color="#fff" strokeWidth={2.5} />
                <Text style={styles.sideButtonText}>Sounds</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideButton}>
                <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>🔊</Text>
                <Text style={styles.sideButtonText}>Voice</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomBar}>
              {isRecording && (
                <View style={styles.recordingInfo}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                </View>
              )}

              <View style={styles.recordButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonActive,
                  ]}
                  onPress={handleRecordButton}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.recordButtonInner,
                      isRecording && styles.recordButtonInnerActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {!isRecording && (
                <View style={styles.bottomHint}>
                  <Text style={styles.bottomHintText}>Hold to record</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topActions: {
    flexDirection: 'row',
    gap: 16,
  },
  topButton: {
    alignItems: 'center',
    gap: 4,
  },
  topButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  sideBar: {
    position: 'absolute' as const,
    right: 16,
    top: '40%',
    gap: 24,
  },
  sideButton: {
    alignItems: 'center',
    gap: 4,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 60,
    gap: 12,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff2e4c',
  },
  recordingTime: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 46, 76, 0.3)',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff2e4c',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  bottomHint: {
    paddingHorizontal: 20,
  },
  bottomHintText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#fff',
    fontSize: 120,
    fontWeight: '700' as const,
  },
  pickerContainer: {
    position: 'absolute' as const,
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    padding: 16,
  },
  pickerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  pickerOptions: {
    gap: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(255, 46, 76, 0.2)',
  },
  pickerOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  pickerOptionTextSelected: {
    color: '#ff2e4c',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute' as const,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewActions: {
    position: 'absolute' as const,
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  discardButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  uploadButton: {
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#ff2e4c',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  webFallbackText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
});
