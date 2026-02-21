import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AttachmentUpload } from './AttachmentUpload';
import { useFormValidation, ValidationRules } from './FormValidation';
import { toast } from "sonner@2.0.3";
import { Loader2, Save, X } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'attachment';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  section?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  icon?: React.ReactNode;
}

interface UniversalFormProps {
  title: string;
  sections: FormSection[];
  validationRules: ValidationRules;
  initialData?: any;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function UniversalForm({
  title,
  sections,
  validationRules,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "حفظ",
  cancelLabel = "إلغاء",
  isLoading = false
}: UniversalFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [attachments, setAttachments] = useState<{ [key: string]: any[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { errors, validateForm, validateSingleField, clearFieldError } = useFormValidation(validationRules);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      clearFieldError(fieldName);
    }
  };

  const handleAttachmentChange = (fieldName: string, files: any[]) => {
    setAttachments(prev => ({
      ...prev,
      [fieldName]: files
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm(formData);
    if (!isValid) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        attachments
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isRequired = field.required || validationRules[field.name]?.required;

    const commonProps = {
      id: field.name,
      value,
      onChange: (e: any) => handleInputChange(field.name, e.target.value),
      className: `${error ? 'border-red-500' : ''} ${field.className || ''}`,
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              rows={4}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'attachment':
        return (
          <div className="space-y-2">
            <AttachmentUpload
              label={`${field.label} ${isRequired ? '*' : ''}`}
              existingFiles={attachments[field.name] || []}
              onFilesChange={(files) => handleAttachmentChange(field.name, files)}
              maxFiles={field.max || 5}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={field.type}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      {sections.length === 1 ? (
        // Single section - render directly
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections[0].fields.map(field => (
              <div key={field.name} className={field.type === 'textarea' || field.type === 'attachment' ? 'md:col-span-2' : ''}>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Multiple sections - render as tabs
        <Tabs defaultValue={sections[0].id} className="w-full">
          <TabsList className={`grid w-full grid-cols-${Math.min(sections.length, 4)}`}>
            {sections.map(section => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.icon} {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map(section => (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map(field => (
                  <div key={field.name} className={field.type === 'textarea' || field.type === 'attachment' ? 'md:col-span-2' : ''}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-reverse space-x-4 pt-6 border-t mt-8">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          <X className="w-4 h-4 ml-2" />
          {cancelLabel}
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting || isLoading}
        >
          {(isSubmitting || isLoading) ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}