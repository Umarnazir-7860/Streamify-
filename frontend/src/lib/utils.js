export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function getCroppedImg(imageSrc, crop) {
  const canvas = document.createElement('canvas');
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve) => {
    image.onload = () => {
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      );
      canvas.toBlob(blob => {
        const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg');
    };
  });
}
