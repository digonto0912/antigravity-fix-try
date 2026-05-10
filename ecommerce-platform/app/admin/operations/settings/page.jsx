'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/shared/Toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function SettingsPage() {
  const { client, updateClient } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [tab, setTab] = useState('business');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  // Business Profile
  const [biz, setBiz] = useState({ businessName:'',contactEmail:'',contactPhone:'',address:'',facebook:'',instagram:'',whatsapp:'' });
  // Storefront
  const [store, setStore] = useState({ storeName:'',tagline:'',primaryColor:'#3b82f6',secondaryColor:'#8b5cf6' });
  // Shipping
  const [ship, setShip] = useState({ flatRate:'60',freeThreshold:'1000',areas:[],estDelivery:'3-5 business days' });
  // Payment
  const [pay, setPay] = useState({ cod:true,bkashEnabled:false,bkashNum:'',nagadEnabled:false,nagadNum:'',bankEnabled:false,bankDetails:'' });
  // Email Templates
  const [emails, setEmails] = useState({ confSubject:'',confBody:'',shipSubject:'',shipBody:'',delSubject:'',delBody:'' });
  // Notifications
  const [notif, setNotif] = useState({ emailNewOrder:true,emailLowStock:true,emailNewCustomer:true,emailNewMessage:true,smsNewOrder:false,smsLowStock:false,smsNewCustomer:false,smsNewMessage:false,notifEmail:'' });

  useEffect(() => {
    if (!client) return;
    setBiz({ businessName:client.businessName,contactEmail:client.contactEmail||'',contactPhone:client.contactPhone||'',address:client.address||'',facebook:client.socialMedia?.facebook||'',instagram:client.socialMedia?.instagram||'',whatsapp:client.socialMedia?.whatsapp||'' });
    const sf = client.storefrontSettings;
    if(sf) setStore({ storeName:sf.storeName,tagline:sf.tagline,primaryColor:sf.primaryColor,secondaryColor:sf.secondaryColor });
    const sh = client.shippingSettings;
    if(sh) setShip({ flatRate:String(sh.flatRate),freeThreshold:String(sh.freeShippingThreshold),areas:sh.deliveryAreas,estDelivery:sh.estimatedDeliveryTime });
    const p = client.paymentSettings;
    if(p) setPay({ cod:p.cod,bkashEnabled:p.bkash.enabled,bkashNum:p.bkash.merchantNumber,nagadEnabled:p.nagad.enabled,nagadNum:p.nagad.merchantNumber,bankEnabled:p.bankTransfer.enabled,bankDetails:p.bankTransfer.accountDetails });
    const et = client.emailTemplates;
    if(et) setEmails({ confSubject:et.orderConfirmation?.subject||'Order Confirmed!',confBody:et.orderConfirmation?.body||'Hi {customer_name}, your order {order_number} has been confirmed.',shipSubject:et.orderShipped?.subject||'Order Shipped!',shipBody:et.orderShipped?.body||'Hi {customer_name}, your order {order_number} has been shipped. Track: {tracking_number}',delSubject:et.orderDelivered?.subject||'Order Delivered!',delBody:et.orderDelivered?.body||'Hi {customer_name}, your order {order_number} has been delivered.' });
    else setEmails({ confSubject:'Order Confirmed!',confBody:'Hi {customer_name}, your order {order_number} has been confirmed.',shipSubject:'Order Shipped!',shipBody:'Hi {customer_name}, your order {order_number} has been shipped.',delSubject:'Order Delivered!',delBody:'Hi {customer_name}, your order {order_number} has been delivered.' });
    const n = client.notifications;
    if(n) setNotif({ emailNewOrder:n.emailNewOrder,emailLowStock:n.emailLowStock,emailNewCustomer:n.emailNewCustomer,emailNewMessage:n.emailNewMessage,smsNewOrder:n.smsNewOrder,smsLowStock:n.smsLowStock,smsNewCustomer:n.smsNewCustomer,smsNewMessage:n.smsNewMessage,notifEmail:n.notificationEmail });
  }, [client]);

  const saveBiz = async () => { await updateClient({ businessName:biz.businessName,contactEmail:biz.contactEmail,contactPhone:biz.contactPhone,address:biz.address,socialMedia:{facebook:biz.facebook,instagram:biz.instagram,whatsapp:biz.whatsapp} }); addToast('Business profile saved','success'); };
  const saveStore = async () => { await updateClient({ storefrontSettings:{storeName:store.storeName,tagline:store.tagline,primaryColor:store.primaryColor,secondaryColor:store.secondaryColor,currency:'BDT'} }); addToast('Storefront settings saved','success'); };
  const saveShip = async () => { await updateClient({ shippingSettings:{flatRate:Number(ship.flatRate),freeShippingThreshold:Number(ship.freeThreshold),deliveryAreas:ship.areas,estimatedDeliveryTime:ship.estDelivery} }); addToast('Shipping saved','success'); };
  const savePay = async () => { await updateClient({ paymentSettings:{cod:pay.cod,bkash:{enabled:pay.bkashEnabled,merchantNumber:pay.bkashNum},nagad:{enabled:pay.nagadEnabled,merchantNumber:pay.nagadNum},bankTransfer:{enabled:pay.bankEnabled,accountDetails:pay.bankDetails}} }); addToast('Payment saved','success'); };
  const saveEmails = async () => { await updateClient({ emailTemplates:{orderConfirmation:{subject:emails.confSubject,body:emails.confBody},orderShipped:{subject:emails.shipSubject,body:emails.shipBody},orderDelivered:{subject:emails.delSubject,body:emails.delBody}} }); addToast('Email templates saved','success'); };
  const saveNotif = async () => { await updateClient({ notifications:{emailNewOrder:notif.emailNewOrder,emailLowStock:notif.emailLowStock,emailNewCustomer:notif.emailNewCustomer,emailNewMessage:notif.emailNewMessage,smsNewOrder:notif.smsNewOrder,smsLowStock:notif.smsLowStock,smsNewCustomer:notif.smsNewCustomer,smsNewMessage:notif.smsNewMessage,notificationEmail:notif.notifEmail} }); addToast('Notifications saved','success'); };

  const handleExport = async () => { const data = await storage.exportAll(); const blob = new Blob([data],{type:'application/json'}); const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='backup.json'; a.click(); addToast('Data exported','success'); };
  const handleImport = (e) => { const file = e.target.files?.[0]; if(!file) return; const reader = new FileReader(); reader.onload = async (ev) => { try { await storage.importAll(ev.target?.result); addToast('Data imported! Refresh page.','success'); } catch { addToast('Invalid file','error'); } }; reader.readAsText(file); };
  const handleClearAll = async () => { if(deleteText!=='DELETE') return; await storage.clearAll(); addToast('All data cleared. Refreshing...','warning'); setTimeout(()=>window.location.reload(),1500); };

  const tabs = [{k:'business',l:'Business'},{k:'storefront',l:'Storefront'},{k:'shipping',l:'Shipping'},{k:'payment',l:'Payment'},{k:'emails',l:'Email Templates'},{k:'notifications',l:'Notifications'},{k:'advanced',l:'Advanced'}];
  const allAreas = ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Rangpur','Mymensingh'];
  const Toggle = ({checked,onChange,label}) => (
    <label className="flex items-center justify-between py-2"><span className="text-sm">{label}</span><button onClick={()=>onChange(!checked)} className={`w-10 h-6 rounded-full transition-colors ${checked?'bg-blue-500':'bg-gray-300'}`}><span className={`block w-4 h-4 bg-white rounded-full transition-transform mx-1 ${checked?'translate-x-4':'translate-x-0'}`}/></button></label>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
      <div className="flex flex-wrap gap-2">{tabs.map(t=><button key={t.k} onClick={()=>setTab(t.k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab===t.k?'bg-blue-500 text-white':'bg-white border text-gray-700 hover:bg-gray-50'}`}>{t.l}</button>)}</div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        {tab==='business'&&<><h2 className="font-semibold">Business Profile</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-600">Business Name</label><input value={biz.businessName} onChange={e=>setBiz({...biz,businessName:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">Email</label><input value={biz.contactEmail} onChange={e=>setBiz({...biz,contactEmail:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">Phone</label><input value={biz.contactPhone} onChange={e=>setBiz({...biz,contactPhone:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <div><label className="text-sm text-gray-600">Address</label><textarea value={biz.address} onChange={e=>setBiz({...biz,address:e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <h3 className="text-sm font-medium pt-2">Social Media</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="text-sm text-gray-600">Facebook</label><input value={biz.facebook} onChange={e=>setBiz({...biz,facebook:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">Instagram</label><input value={biz.instagram} onChange={e=>setBiz({...biz,instagram:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">WhatsApp</label><input value={biz.whatsapp} onChange={e=>setBiz({...biz,whatsapp:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <button onClick={saveBiz} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Save</button>
        </>}

        {tab==='storefront'&&<><h2 className="font-semibold">Storefront Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-600">Store Name</label><input value={store.storeName} onChange={e=>setStore({...store,storeName:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">Tagline</label><input value={store.tagline} onChange={e=>setStore({...store,tagline:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">Primary Color</label><div className="flex gap-2 mt-1"><input type="color" value={store.primaryColor} onChange={e=>setStore({...store,primaryColor:e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input value={store.primaryColor} onChange={e=>setStore({...store,primaryColor:e.target.value})} className="flex-1 px-3 py-2 border rounded-lg text-sm" /></div></div>
            <div><label className="text-sm text-gray-600">Secondary Color</label><div className="flex gap-2 mt-1"><input type="color" value={store.secondaryColor} onChange={e=>setStore({...store,secondaryColor:e.target.value})} className="w-10 h-10 rounded cursor-pointer" /><input value={store.secondaryColor} onChange={e=>setStore({...store,secondaryColor:e.target.value})} className="flex-1 px-3 py-2 border rounded-lg text-sm" /></div></div>
          </div>
          <div><label className="text-sm text-gray-600">Currency</label><input value="BDT (৳)" disabled className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50" /></div>
          <button onClick={saveStore} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Save</button>
        </>}

        {tab==='shipping'&&<><h2 className="font-semibold">Shipping Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-600">Flat Rate (৳)</label><input type="number" value={ship.flatRate} onChange={e=>setShip({...ship,flatRate:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm text-gray-600">Free Shipping Over (৳)</label><input type="number" value={ship.freeThreshold} onChange={e=>setShip({...ship,freeThreshold:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <div><label className="text-sm text-gray-600">Delivery Areas</label><div className="flex flex-wrap gap-2 mt-2">{allAreas.map(a=><button key={a} onClick={()=>setShip({...ship,areas:ship.areas.includes(a)?ship.areas.filter(x=>x!==a):[...ship.areas,a]})} className={`px-3 py-1 rounded-full text-xs ${ship.areas.includes(a)?'bg-blue-500 text-white':'bg-gray-100 text-gray-600'}`}>{a}</button>)}</div></div>
          <div><label className="text-sm text-gray-600">Estimated Delivery</label><input value={ship.estDelivery} onChange={e=>setShip({...ship,estDelivery:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <button onClick={saveShip} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Save</button>
        </>}

        {tab==='payment'&&<><h2 className="font-semibold">Payment Settings</h2>
          <div className="space-y-4">
            <Toggle checked={pay.cod} onChange={v=>setPay({...pay,cod:v})} label="Cash on Delivery" />
            <div className="border-t pt-3"><Toggle checked={pay.bkashEnabled} onChange={v=>setPay({...pay,bkashEnabled:v})} label="bKash" />{pay.bkashEnabled&&<input value={pay.bkashNum} onChange={e=>setPay({...pay,bkashNum:e.target.value})} placeholder="Merchant number" className="w-full mt-2 px-3 py-2 border rounded-lg text-sm" />}</div>
            <div className="border-t pt-3"><Toggle checked={pay.nagadEnabled} onChange={v=>setPay({...pay,nagadEnabled:v})} label="Nagad" />{pay.nagadEnabled&&<input value={pay.nagadNum} onChange={e=>setPay({...pay,nagadNum:e.target.value})} placeholder="Merchant number" className="w-full mt-2 px-3 py-2 border rounded-lg text-sm" />}</div>
            <div className="border-t pt-3"><Toggle checked={pay.bankEnabled} onChange={v=>setPay({...pay,bankEnabled:v})} label="Bank Transfer" />{pay.bankEnabled&&<textarea value={pay.bankDetails} onChange={e=>setPay({...pay,bankDetails:e.target.value})} placeholder="Account details" rows={2} className="w-full mt-2 px-3 py-2 border rounded-lg text-sm" />}</div>
          </div>
          <button onClick={savePay} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Save</button>
        </>}

        {tab==='emails'&&<><h2 className="font-semibold">Email Templates</h2>
          {[{title:'Order Confirmation',subj:emails.confSubject,body:emails.confBody,setSub:(v)=>setEmails({...emails,confSubject:v}),setBody:(v)=>setEmails({...emails,confBody:v})},{title:'Order Shipped',subj:emails.shipSubject,body:emails.shipBody,setSub:(v)=>setEmails({...emails,shipSubject:v}),setBody:(v)=>setEmails({...emails,shipBody:v})},{title:'Order Delivered',subj:emails.delSubject,body:emails.delBody,setSub:(v)=>setEmails({...emails,delSubject:v}),setBody:(v)=>setEmails({...emails,delBody:v})}].map(t=>(
            <div key={t.title} className="border rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium">{t.title}</h3>
              <input value={t.subj} onChange={e=>t.setSub(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <textarea value={t.body} onChange={e=>t.setBody(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <p className="text-xs text-gray-400">Variables: {'{customer_name}'}, {'{order_number}'}, {'{tracking_number}'}, {'{business_name}'}</p>
            </div>
          ))}
          <button onClick={saveEmails} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Save</button>
        </>}

        {tab==='notifications'&&<><h2 className="font-semibold">Notifications</h2>
          <h3 className="text-sm font-medium text-gray-500 pt-2">Email Notifications</h3>
          <Toggle checked={notif.emailNewOrder} onChange={v=>setNotif({...notif,emailNewOrder:v})} label="New order placed" />
          <Toggle checked={notif.emailLowStock} onChange={v=>setNotif({...notif,emailLowStock:v})} label="Low stock alert" />
          <Toggle checked={notif.emailNewCustomer} onChange={v=>setNotif({...notif,emailNewCustomer:v})} label="New customer registered" />
          <Toggle checked={notif.emailNewMessage} onChange={v=>setNotif({...notif,emailNewMessage:v})} label="New message received" />
          <h3 className="text-sm font-medium text-gray-500 pt-4">SMS Notifications</h3>
          <Toggle checked={notif.smsNewOrder} onChange={v=>setNotif({...notif,smsNewOrder:v})} label="New order (SMS)" />
          <Toggle checked={notif.smsLowStock} onChange={v=>setNotif({...notif,smsLowStock:v})} label="Low stock (SMS)" />
          <div className="pt-2"><label className="text-sm text-gray-600">Notification Email</label><input value={notif.notifEmail} onChange={e=>setNotif({...notif,notifEmail:e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <button onClick={saveNotif} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">Save</button>
        </>}

        {tab==='advanced'&&<><h2 className="font-semibold">Advanced</h2>
          <div className="space-y-4">
            <div className="flex gap-3"><button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">📥 Export All Data</button>
              <label className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm cursor-pointer">📤 Import Data<input type="file" accept=".json" onChange={handleImport} className="hidden" /></label></div>
            <div className="border-t pt-4"><h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-3">Type DELETE to confirm clearing all data.</p>
              <div className="flex gap-2"><input value={deleteText} onChange={e=>setDeleteText(e.target.value)} placeholder='Type "DELETE"' className="px-3 py-2 border border-red-300 rounded-lg text-sm" /><button onClick={()=>{if(deleteText==='DELETE')handleClearAll();}} disabled={deleteText!=='DELETE'} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm disabled:bg-gray-300">Clear All Data</button></div>
            </div>
          </div>
        </>}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
