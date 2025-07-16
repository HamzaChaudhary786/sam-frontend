export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'Employee_Photos'); // Replace with your preset name
  formData.append('cloud_name', 'dxisw0kcc'); // Replace with your actual cloud name

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dxisw0kcc/image/upload`, // Replace with your cloud name
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Upload failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};