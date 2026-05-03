import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { campaignAPI } from '../../lib/api';
import { StepIndicator } from '../../components/campaigns/StepIndicator';
import { AudienceUploader } from '../../components/campaigns/AudienceUploader';
import { CampaignSettings } from '../../components/campaigns/CampaignSettings';
import { HtmlEditorModal } from '../../components/ui/HtmlEditorModal';
import { CampaignPreviewModal } from '../../components/campaigns/CampaignPreviewModal';
import { SendConfirmDialog } from '../../components/campaigns/SendConfirmDialog';
import { ArrowLeft, ArrowRight, Eye, Code, Send, Save, Calendar } from 'lucide-react';

const STEPS = ['Name & Subject', 'Template', 'Audience', 'Settings', 'Review & Launch'];

export const CampaignNewPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_body: '',
    csvFile: null,
    csvRowCount: 0,
    csvFilename: '',
    contacts: [],
    track_opens: true,
    track_clicks: true,
    rate_limit: 60,
    schedule_type: 'one_time',
    scheduled_at: '',
    cron_expression: '',
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  const updateForm = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Campaign name is required';
      }
      if (!formData.subject.trim()) {
        newErrors.subject = 'Subject line is required';
      }
    }

    if (step === 1) {
      if (!formData.html_body.trim()) {
        newErrors.html_body = 'Email template is required';
      }
    }

    if (step === 2) {
      if (!formData.csvFile) {
        newErrors.csv = 'Please upload a CSV file with your contacts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors before continuing');
      return;
    }
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleAudienceUpload = (file, result) => {
    updateForm({
      csvFile: file,
      csvRowCount: result.rowCount,
      contacts: result.contacts,
    });
  };

  const handleAudienceClear = () => {
    updateForm({
      csvFile: null,
      csvRowCount: 0,
      contacts: [],
    });
  };

  const handleHtmlSave = (html) => {
    updateForm({ html_body: html });
  };

  const handleCreateDraft = async () => {
    setIsSubmitting(true);
    try {
      const response = await campaignAPI.create({
        name: formData.name,
        subject: formData.subject,
        html_body: formData.html_body,
        rate_limit: formData.rate_limit,
        track_opens: formData.track_opens,
        track_clicks: formData.track_clicks,
      });

      const campaign = response.data;

      // Upload CSV if we have one
      if (formData.csvFile) {
        await campaignAPI.upload(campaign.id, formData.csvFile);
      }

      toast.success('Campaign created as draft');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!formData.scheduled_at) {
      toast.error('Please set a scheduled date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await campaignAPI.create({
        name: formData.name,
        subject: formData.subject,
        html_body: formData.html_body,
        rate_limit: formData.rate_limit,
        track_opens: formData.track_opens,
        track_clicks: formData.track_clicks,
      });

      const campaign = response.data;

      // Upload CSV
      if (formData.csvFile) {
        await campaignAPI.upload(campaign.id, formData.csvFile);
      }

      // Schedule
      await campaignAPI.schedule(campaign.id, {
        schedule_type: formData.schedule_type,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
      });

      toast.success('Campaign scheduled');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Failed to schedule campaign:', error);
      toast.error('Failed to schedule campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      const response = await campaignAPI.create({
        name: formData.name,
        subject: formData.subject,
        html_body: formData.html_body,
        rate_limit: formData.rate_limit,
        track_opens: formData.track_opens,
        track_clicks: formData.track_clicks,
      });

      const campaign = response.data;

      // Upload CSV
      if (formData.csvFile) {
        await campaignAPI.upload(campaign.id, formData.csvFile);
      }

      // Send immediately
      await campaignAPI.send(campaign.id);

      toast.success('Campaign is being sent');
      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Failed to send campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setIsSubmitting(false);
      setShowSendConfirm(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Card className="p-6 md:p-8">
              {/* Step 1: Name & Subject */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-1">
                      Name & Subject
                    </h2>
                    <p className="text-text-muted">
                      Give your campaign a name and craft a compelling subject line
                    </p>
                  </div>

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
                </div>
              )}

              {/* Step 2: Template */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-1">
                      Email Template
                    </h2>
                    <p className="text-text-muted">
                      Create your email content using HTML or use the code editor
                    </p>
                  </div>

                  <Textarea
                    label="HTML Content"
                    value={formData.html_body}
                    onChange={(e) => updateForm({ html_body: e.target.value })}
                    placeholder="<h1>Hello {{first_name}}</h1><p>Welcome to {{company}}!</p>"
                    rows={12}
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

                  <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                    <p className="text-sm text-text-muted">
                      <span className="font-medium text-text-secondary">Available merge tags:</span>{' '}
                      {'{{email}}'}, {'{{first_name}}'}, {'{{last_name}}'}, {'{{company}}'}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Audience */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-1">
                      Audience
                    </h2>
                    <p className="text-text-muted">
                      Upload a CSV file with your contacts. The email column is required.
                    </p>
                  </div>

                  <AudienceUploader
                    onUpload={handleAudienceUpload}
                    onClear={handleAudienceClear}
                    csvRowCount={formData.csvRowCount}
                    csvFilename={formData.csvFilename}
                  />

                  {errors.csv && (
                    <p className="text-sm text-error">{errors.csv}</p>
                  )}
                </div>
              )}

              {/* Step 4: Settings */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-1">
                      Settings
                    </h2>
                    <p className="text-text-muted">
                      Configure tracking, sending rate, and schedule for your campaign
                    </p>
                  </div>

                  <CampaignSettings
                    track_opens={formData.track_opens}
                    track_clicks={formData.track_clicks}
                    rate_limit={formData.rate_limit}
                    schedule_type={formData.schedule_type}
                    scheduled_at={formData.scheduled_at}
                    cron_expression={formData.cron_expression}
                    onChange={updateForm}
                    errors={errors}
                  />
                </div>
              )}

              {/* Step 5: Review & Launch */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-1">
                      Review & Launch
                    </h2>
                    <p className="text-text-muted">
                      Review your campaign settings before sending
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                        <p className="text-sm text-text-muted mb-1">Campaign Name</p>
                        <p className="font-medium text-text-primary">{formData.name || '—'}</p>
                      </div>
                      <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                        <p className="text-sm text-text-muted mb-1">Subject</p>
                        <p className="font-medium text-text-primary">{formData.subject || '—'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-surface-elevated border border-border rounded-lg">
                      <p className="text-sm text-text-muted mb-1">Audience</p>
                      <p className="font-medium text-text-primary">
                        {formData.csvRowCount > 0
                          ? `${formData.csvRowCount} contacts`
                          : 'No contacts uploaded'}
                      </p>
                    </div>

                    <div className="p-4 bg-surface-elevated border border-border rounded-lg space-y-2">
                      <p className="text-sm text-text-muted">Settings</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-text-secondary">
                          Track opens: <span className="text-text-primary">{formData.track_opens ? 'Yes' : 'No'}</span>
                        </p>
                        <p className="text-text-secondary">
                          Track clicks: <span className="text-text-primary">{formData.track_clicks ? 'Yes' : 'No'}</span>
                        </p>
                        <p className="text-text-secondary">
                          Rate limit: <span className="text-text-primary">{formData.rate_limit}/min</span>
                        </p>
                        <p className="text-text-secondary">
                          Schedule: <span className="text-text-primary">{formData.schedule_type === 'one_time' ? 'One-time' : 'Recurring'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-3">
            {currentStep === STEPS.length - 1 ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCreateDraft}
                  loading={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                {formData.schedule_type === 'one_time' && formData.scheduled_at && (
                  <Button
                    variant="secondary"
                    onClick={handleSchedule}
                    loading={isSubmitting}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                )}
                <Button onClick={() => setShowSendConfirm(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Button>
              </>
            ) : (
              <Button onClick={goNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
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
      />

      <SendConfirmDialog
        isOpen={showSendConfirm}
        campaign={{ name: formData.name, subject: formData.subject }}
        contactCount={formData.csvRowCount}
        onConfirm={handleSend}
        onCancel={() => setShowSendConfirm(false)}
      />
    </Layout>
  );
};

export default CampaignNewPage;
