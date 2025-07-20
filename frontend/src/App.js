import React, { useState, useEffect } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  Pause,
  Image,
  AudioFile,
  Close,
  Refresh,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/media');
      setMedia(response.data);
      enqueueSnackbar('Media loaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error fetching media:', error);
      enqueueSnackbar('Failed to load media files', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post('/media', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(`Failed to upload ${file.name}`);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setMedia(prev => [...prev, ...results]);
      enqueueSnackbar(`Successfully uploaded ${files.length} file(s)!`, { variant: 'success' });
      setUploadDialog(false);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const playAudio = (item) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingId(null);
    }

    if (playingId !== item._id) {
      const audio = new Audio(item.url);
      audio.play();
      setCurrentAudio(audio);
      setPlayingId(item._id);

      audio.onended = () => {
        setCurrentAudio(null);
        setPlayingId(null);
      };

      audio.onerror = () => {
        enqueueSnackbar('Failed to play audio', { variant: 'error' });
        setCurrentAudio(null);
        setPlayingId(null);
      };
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
    },
    onDrop: uploadFiles,
    multiple: true
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🎵 Media Storage & Playback
          </Typography>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={fetchMedia} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {/* Statistics */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                    <Image />
                  </Avatar>
                  <Typography variant="h4" component="div">
                    {media.filter(item => item.type === 'image').length}
                  </Typography>
                  <Typography color="text.secondary">Images</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                    <AudioFile />
                  </Avatar>
                  <Typography variant="h4" component="div">
                    {media.filter(item => item.type === 'audio').length}
                  </Typography>
                  <Typography color="text.secondary">Audio Files</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                    <CloudUpload />
                  </Avatar>
                  <Typography variant="h4" component="div">
                    {media.length}
                  </Typography>
                  <Typography color="text.secondary">Total Files</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Loading */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Media Grid */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {media.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {item.type === 'image' ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.url}
                        alt={item.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'action.hover',
                          cursor: 'pointer',
                        }}
                        onClick={() => playAudio(item)}
                      >
                        <IconButton
                          size="large"
                          sx={{ 
                            width: 80, 
                            height: 80,
                            bgcolor: playingId === item._id ? 'secondary.main' : 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: playingId === item._id ? 'secondary.dark' : 'primary.dark',
                            }
                          }}
                        >
                          {playingId === item._id ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={item.type} 
                          size="small" 
                          color={item.type === 'image' ? 'primary' : 'secondary'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(item.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* Empty State */}
        {!loading && media.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Avatar sx={{ bgcolor: 'action.hover', mx: 'auto', mb: 2, width: 80, height: 80 }}>
              <CloudUpload sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No media files yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Upload your first image or audio file to get started
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUpload />}
              onClick={() => setUploadDialog(true)}
            >
              Upload Files
            </Button>
          </Box>
        )}
      </Container>

      {/* Upload FAB */}
      <Fab
        color="primary"
        aria-label="upload"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setUploadDialog(true)}
      >
        <CloudUpload />
      </Fab>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Media Files
          <IconButton
            aria-label="close"
            onClick={() => setUploadDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports: Images (JPEG, PNG, GIF, WebP) and Audio (MP3, WAV, OGG, M4A, AAC)
            </Typography>
          </Box>
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading files...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
