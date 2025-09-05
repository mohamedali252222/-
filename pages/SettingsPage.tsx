import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CompanyProfile, Settings as SettingsType } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { useData } from '../contexts/DataContext';

const SettingsPage: React.FC = () => {
  const { companyProfile, setCompanyProfile, settings, setSettings } = useData();
  const [profile, setProfile] = useState<CompanyProfile>(companyProfile);
  const [currentSettings, setCurrentSettings] = useState<SettingsType>(settings);
  const [logoPreview, setLogoPreview] = useState<string>(profile.logoUrl);
  const { showNotification } = useNotification();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentSettings({ 
      ...currentSettings, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setProfile({ ...profile, logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyProfile(profile);
    showNotification('تم حفظ بيانات الشركة بنجاح!', 'success');
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(currentSettings);
    showNotification('تم حفظ إعدادات النظام بنجاح!', 'success');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="بيانات الشركة">
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <Input label="اسم الشركة" name="name" value={profile.name} onChange={handleProfileChange} />
            <Input label="العنوان" name="address" value={profile.address} onChange={handleProfileChange} />
            <Input label="رقم التسجيل الضريبي" name="taxRegistration" value={profile.taxRegistration} onChange={handleProfileChange} />
            <Input label="معلومات التواصل" name="contactInfo" value={profile.contactInfo} onChange={handleProfileChange} />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شعار الشركة</label>
                <div className="flex items-center space-x-4 space-x-reverse">
                    <img src={logoPreview} alt="Logo Preview" className="h-16 w-auto bg-gray-100 p-1 rounded object-contain"/>
                    <input 
                      type="file" 
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
            </div>
            <div className="pt-2">
                <Button type="submit">حفظ التغييرات</Button>
            </div>
          </form>
        </Card>

        <Card title="إعدادات النظام">
            <form className="space-y-4" onSubmit={handleSettingsSubmit}>
                <Input label="نسبة ضريبة القيمة المضافة (%)" type="number" name="vatPercentage" value={currentSettings.vatPercentage} onChange={handleSettingsChange} />
                <Input label="بادئة الفواتير" name="invoicePrefix" value={currentSettings.invoicePrefix} onChange={handleSettingsChange} />
                <Input label="رقم الفاتورة التالي" type="number" name="nextInvoiceNumber" value={currentSettings.nextInvoiceNumber} onChange={handleSettingsChange} />
                <div className="pt-2">
                    <Button type="submit">حفظ الإعدادات</Button>
                </div>
            </form>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;