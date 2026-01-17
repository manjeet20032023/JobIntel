import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { ResumeUploadModal } from '@/components/ResumeUploadModal';

interface ResumeData {
  id: string;
  status: string;
  parsedAt: string;
  format: string;
  matchingScore?: number;
  potentialMatches?: number;
}

interface ParsedData {
  skills: string[];
  email?: string;
  phone?: string;
  location?: string;
  name?: string;
  batch?: string;
}

interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

const ResumePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [matchingJobs, setMatchingJobs] = useState<JobMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    fetchResumeData();
  }, [user]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/resume/status', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
        setError('');
        
        // Fetch matching jobs
        fetchMatchingJobs(token);
      } else if (response.status === 404) {
        setResumeData(null);
      } else {
        setError('Failed to fetch resume data');
      }
    } catch (err) {
      console.error('Failed to fetch resume', err);
      setError('Error loading resume');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingJobs = async (token: string) => {
    try {
      setLoadingMatches(true);
      const response = await fetch('/api/resume/matching-jobs?minScore=50', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMatchingJobs(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to fetch matching jobs:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleResumeUploaded = (uploadedParsedData: ParsedData | null) => {
    setShowUploadModal(false);
    setParsedData(uploadedParsedData);
    fetchResumeData();
  };

  const deleteResume = async () => {
    if (!resumeData) return;
    
    try {
      setDeleting(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/resume/${resumeData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Clear all resume data from UI immediately
        setResumeData(null);
        setParsedData(null);
        setMatchingJobs([]);
        
        // Show success with deletion details
        const details = data.deletionDetails;
        const msg = `✓ Resume deleted successfully from database!\n\nRemoved:\n- ${details.skillsRemoved} auto-parsed skills\n- ${details.jobMatchesDeleted} job matches`;
        setSuccess(msg);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else if (response.status === 404) {
        // Resume already deleted or doesn't exist
        setResumeData(null);
        setParsedData(null);
        setMatchingJobs([]);
        const errorData = await response.json();
        setError(errorData.error || 'Resume not found');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete resume from database');
      }
    } catch (err) {
      console.error('Failed to delete resume', err);
      setError('Error deleting resume from database');
    } finally {
      setDeleting(false);
    }
  };

  const downloadResume = async () => {
    if (!resumeData) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/resume/${resumeData.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume.${resumeData.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download resume', err);
      setError('Error downloading resume');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-muted rounded-xl p-8 h-40 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-muted rounded-xl p-8 h-40 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resume & CV</h1>
          <p className="text-muted-foreground">Upload resume for auto-parsing and AI-powered job matching</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="gap-2 bg-gradient-to-r from-primary to-accent w-full sm:w-auto"
        >
          <FileText className="h-4 w-4" />
          {resumeData ? 'Update Resume' : 'Upload Resume'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-900 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="whitespace-pre-line">{success}</p>
        </div>
      )}

      <ResumeUploadModal
        open={showUploadModal}
        onOpenChange={(open, uploadedData) => {
          setShowUploadModal(open);
          if (!open && uploadedData) {
            handleResumeUploaded(uploadedData);
          }
        }}
      />

      {resumeData ? (
        <div className="space-y-8">
          {/* Resume Info & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Resume Successfully Uploaded ✓</h4>
                    <p className="text-sm text-green-800 mb-2">
                      Your resume was processed on {new Date(resumeData.parsedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-800">
                      Status: <strong>{resumeData.status || 'Processed'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsed Data Display */}
              {parsedData && Object.values(parsedData).some(v => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)) && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Auto-Parsed Data from Resume
                  </h4>
                  <div className="space-y-4">
                    {parsedData.skills && parsedData.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-2">✓ Skills Extracted ({parsedData.skills.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-blue-200 text-blue-900">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(parsedData.email || parsedData.phone || parsedData.location || parsedData.batch) && (
                      <div className="pt-4 border-t border-blue-200">
                        <p className="text-sm text-blue-800 font-medium mb-2">✓ Profile Information Extracted</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                          {parsedData.name && <div><strong>Name:</strong> {parsedData.name}</div>}
                          {parsedData.email && <div><strong>Email:</strong> {parsedData.email}</div>}
                          {parsedData.phone && <div><strong>Phone:</strong> {parsedData.phone}</div>}
                          {parsedData.location && <div><strong>Location:</strong> {parsedData.location}</div>}
                          {parsedData.batch && <div><strong>Year:</strong> {parsedData.batch}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Details */}
              <div className="space-y-4">
                <h4 className="font-semibold">Resume Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">File Format</p>
                    <p className="font-semibold">{resumeData.format?.toUpperCase() || 'PDF'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-semibold">{new Date(resumeData.parsedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Parsing Status</p>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">AI Matching</p>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={downloadResume}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <FileText className="h-4 w-4" />
                  Replace
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteResume}
                  disabled={deleting}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Tips Sidebar */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4">Resume Tips 💡</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Include relevant keywords</li>
                  <li>✓ List recent projects</li>
                  <li>✓ Highlight technical skills</li>
                  <li>✓ Use standard formatting</li>
                  <li>✓ Keep to 1-2 pages</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Matching Jobs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                AI-Matched Job Opportunities
              </h2>
              {loadingMatches && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            {matchingJobs.length > 0 ? (
              <div className="grid gap-4">
                {matchingJobs.map((job) => (
                  <div key={job.jobId} className="bg-card rounded-xl p-6 border border-border/40 hover:border-accent/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white text-lg px-3 py-1">
                        {job.matchScore}%
                      </Badge>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-2">Why it matches:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      {job.matchedSkills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-green-700 mb-2">Your Skills Match:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.matchedSkills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="bg-green-100 text-green-900 text-xs">
                                ✓ {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.missingSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-amber-700 mb-2">Skills to Learn:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.missingSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-amber-700 border-amber-200 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => navigate(`/jobs/${job.jobId}`)}
                      className="w-full gap-2 bg-gradient-to-r from-primary to-accent"
                    >
                      <FileText className="h-4 w-4" />
                      View & Apply
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl p-12 border border-border/40 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {loadingMatches ? 'Finding matching jobs...' : 'No matching jobs found. Check back later!'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-12 border border-border/40 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-semibold mb-2">No Resume Uploaded</p>
          <p className="text-muted-foreground mb-6">Upload your resume to get AI-powered job matches and auto-populate your profile</p>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="gap-2 bg-gradient-to-r from-primary to-accent"
          >
            <FileText className="h-4 w-4" />
            Upload Resume Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResumePage;
