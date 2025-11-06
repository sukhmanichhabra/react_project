# Cloudinary Migration Setup Guide

This guide will help you complete the migration from local Multer storage to Cloudinary for all image uploads.

## ✅ What Has Been Done

All routes and controllers have been updated to use Cloudinary for image uploads:

### **Updated Files:**
1. ✅ `config/cloudinary.js` - Cloudinary configuration
2. ✅ `routes/property.js` - Property image uploads
3. ✅ `routes/dashboard.js` - Profile image uploads
4. ✅ `routes/loan.js` - Loan document uploads
5. ✅ `routes/blog.js` - Blog image uploads
6. ✅ `controllers/loan.js` - Loan document handling
7. ✅ `controllers/blog.js` - Blog image handling

### **Image Storage Locations on Cloudinary:**
- **Property Images**: `real-estate/properties/`
- **Profile Images**: `real-estate/profiles/`
- **Loan Documents**: `real-estate/loan-documents/`
- **Blog Images**: `real-estate/blog/`

## 📦 Step 1: Install Required Packages

Run the following command to install Cloudinary dependencies:

```bash
npm install cloudinary multer-storage-cloudinary
```

## 🔑 Step 2: Set Up Cloudinary Account

1. **Create a Cloudinary account** (if you don't have one):
   - Go to https://cloudinary.com/
   - Sign up for a free account

2. **Get your credentials**:
   - Go to your Dashboard: https://cloudinary.com/console
   - Copy your **Cloud Name**, **API Key**, and **API Secret**

## ⚙️ Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## 🚀 Step 4: Start Your Server

```bash
npm start
```

## 🧪 Step 5: Test Image Uploads

Test each upload functionality:

### **1. Property Images**
- Go to Seller Dashboard → Add Listing
- Upload property images (up to 10 images)
- Submit the form
- Check Cloudinary dashboard to verify images are uploaded

### **2. Profile Images**
- Go to Dashboard → Profile
- Update profile image
- Check Cloudinary dashboard

### **3. Loan Documents**
- Go to Loan Application
- Upload documents (PDF/Images)
- Submit application
- Check Cloudinary dashboard

### **4. Blog Images**
- Go to Admin → Create Blog
- Upload blog image
- Submit blog
- Check Cloudinary dashboard

## 🎨 Image Transformations

Cloudinary automatically optimizes images with these settings:

### **Property Images:**
- Max dimensions: 1200x800px
- Quality: Auto
- Format: Auto (WebP when supported)

### **Profile Images:**
- Max dimensions: 500x500px
- Quality: Auto
- Crop: Limit

### **Blog Images:**
- Max dimensions: 1200x675px
- Quality: Auto

## 📊 Benefits of Cloudinary

✅ **Automatic Image Optimization** - Reduces bandwidth
✅ **CDN Delivery** - Fast loading worldwide
✅ **Responsive Images** - Serve different sizes based on device
✅ **Transformations** - Resize, crop, and format on-the-fly
✅ **Backup** - Images are safely stored in the cloud
✅ **Scalable** - Handle millions of images

## 🔄 Migrating Existing Images (Optional)

If you have existing images in `public/uploads/`, you can migrate them:

1. **Manual Upload**:
   - Go to Cloudinary Dashboard → Media Library
   - Upload your existing images to the appropriate folders

2. **Programmatic Upload** (Advanced):
   ```javascript
   const cloudinary = require('./config/cloudinary').cloudinary;
   const fs = require('fs');
   const path = require('path');

   async function migrateImages() {
     const uploadDir = 'public/uploads/properties';
     const files = fs.readdirSync(uploadDir);
     
     for (const file of files) {
       const filePath = path.join(uploadDir, file);
       const result = await cloudinary.uploader.upload(filePath, {
         folder: 'real-estate/properties'
       });
       console.log('Uploaded:', file, '→', result.secure_url);
     }
   }
   ```

## 🗑️ Cleanup (After Migration)

Once you've confirmed everything works:

1. **Remove old upload folders** (optional):
   ```bash
   rm -rf public/uploads
   ```

2. **Update .gitignore**:
   ```
   # No longer needed since using Cloudinary
   # public/uploads/
   ```

## 🛠️ Troubleshooting

### **Images not uploading?**
- Check your `.env` file has correct Cloudinary credentials
- Verify you've installed `cloudinary` and `multer-storage-cloudinary`
- Check console for errors

### **Images not displaying?**
- Check browser console for CORS errors
- Verify Cloudinary URLs are accessible
- Check if images are in the correct folder on Cloudinary

### **Slow uploads?**
- Cloudinary uploads may be slower than local for the first time
- Images are cached and delivered via CDN afterwards
- Consider implementing upload progress indicators

## 📞 Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Cloudinary Support**: https://support.cloudinary.com/

## 🎉 You're All Set!

Your application now uses Cloudinary for all image uploads. Enjoy faster, more scalable image management!
