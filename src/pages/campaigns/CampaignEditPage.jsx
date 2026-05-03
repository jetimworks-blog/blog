import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { campaignAPI } from '../../lib/api';
import { HtmlEditorModal } from '../../components/ui/HtmlEditorModal';
import { CampaignPreviewModal } from '../../components/campaigns/CampaignPreviewModal';
import { ArrowLeft, Eye, Code, Save } from 'lucide-react';

export const CampaignEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [campaign, setCampaign] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_body: '',
    track_opens: true,
    track_clicks: true,
    rate_limit: 60,
  });

  const [errors, setErrors] = useState({});
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await campaignAPI.get(id);
        const c = response.data;

        // Only allow editing draft campaigns
        if (c.status !== 'draft') {
          toast.error('Only draft campaigns can be edited');
          navigate(`/campaigns/${id}`);
          return;
        }

        setCampaign(c);
        setFormData({
          name: c.name || '',
          subject: c.subject || '',
          html_body: c.html_body || '',
          track_opens: c.track_opens ?? true,
          track_clicks: c.track_clicks ?? true,
          rate_limit: c.rate_limit || 60,
        });
      } catch (error) {
        console.error('Failed to load campaign:', error);
        toast.error('Failed to load campaign');
        navigate('/campaigns');
      } finally {
        setIsLoading(false);
      }
    };
    loadCampaign();
  }, [id, navigate]);

  const updateForm = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject line is required';
    }
    if (!formData.html_body.trim()) {
      newErrors.html_body = 'Email template is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      await campaignAPI.update(id, {
        name: formData.name,
        subject: formData.subject,
        html_body: formData.html_body,
        rate_limit: formData.rate_limit,
        track_opens: formData.track_opens,
        track_clicks: formData.track_clicks,
      });
      toast.success('Campaign updated');
      navigate(`/campaigns/${id}`);
    } catch (error) {
      console.error('Failed to update campaign:', error);
      toast.error('Failed to update campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHtmlSave = (html) => {
    updateForm({ html_body: html });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size={32} />
            <p className="text-text-muted">Loading campaign...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/campaigns/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Button>
          <h1 className="text-2xl md:text-3xl text-text-primary">
            Edit Campaign
          </h1>
          <p className="text-text-muted">Update your campaign details</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 md:p-8 space-y-6">
            <Input
              label="Campaign Name"
              value={formData.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="Summer Sale 2026"
              error={errors.name}
              required
            />

            <div>
              <Textarea
                label="Subject Line"
                value={formData.subject}
                onChange={(e) => updateForm({ subject: e.target.value })}
                placeholder="Hi {{first_name}}, check out our summer sale!"
                rows={2}
                maxLength={200}
                error={errors.subject}
                required
              />
              <p className="text-xs text-text-muted mt-1">
                Use merge tags like {'{{first_name}}'} for personalization
              </p>
            </div>

            <Textarea
              label="HTML Content"
              value={formData.html_body}
              onChange={(e) => updateForm({ html_body: e.target.value })}
              placeholder="<h1>Hello {{first_name}}</h1><p>Welcome to {{company}}!</p>"
              rows={10}
              error={errors.html_body}
              required
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowHtmlEditor(true)}
              >
                <Code className="w-4 h-4 mr-2" />
                Edit in Code Editor
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowPreview(true)}
                disabled={!formData.html_body}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* Tracking options */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-text-primary">Tracking</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.track_opens}
                    onChange={(e) => updateForm({ track_opens: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-primary">Track opens</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.track_clicks}
                    onChange={(e) => updateForm({ track_clicks: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-primary">Track clicks</span>
                </label>
              </div>
            </div>

            {/* Rate limit */}
            <div className="pt-4 border-t border-border">
              <Input
                type="number"
                label="Rate Limit (emails per minute)"
                value={formData.rate_limit}
                onChange={(e) => updateForm({ rate_limit: parseInt(e.target.value) || 60 })}
                min={1}
                max={1000}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => navigate(`/campaigns/${id}`)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} loading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <HtmlEditorModal
        isOpen={showHtmlEditor}
        html={formData.html_body}
        onSave={handleHtmlSave}
        onClose={() => setShowHtmlEditor(false)}
      />

      <CampaignPreviewModal
        isOpen={showPreview}
        html={formData.html_body}
        onClose={() => setShowPreview(false)}
        campaign={formData}
      />
    </Layout>
  );
};

export default CampaignEditPage;
