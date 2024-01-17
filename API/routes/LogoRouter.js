import express from 'express';
import cloudinary from '../services/Cloudinary/cloudinary_config.js';
import User from '../models/User.js';
import uploadSingleLogo from '../middleware/multerSingleLogoMiddleware.js';
import checkToken from '../middleware/checkToken.js';

const router = express.Router();

// Rota para fazer o upload da imagem do user
router.put('/upload-logo/:userId', uploadSingleLogo.single('logo'), checkToken, async (req, res) => {
    const { userId } = req.params;
    var folderPath = `user/logos/${userId}`
    try {
        // Verificar se o user existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Caminho do arquivo na pasta local
        const path = req.file.path;

        if (path) {
            const result = await cloudinary.uploader.upload(path, {
                public_id: userId,
                overwrite: true,
                folder: folderPath,
                transformation: [
                    { height: 50, width: 50, crop: 'fit' }
                ],
            });
          
            const imageUrl = result.secure_url;
     
            // Atualizar o user com a URL da imagem
            user.logoUrl = imageUrl;
       
            console.log("Image url", user.logoUrl)
            await user.save()

            return res.status(200).send(imageUrl);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Failed to upload image');
    }
});
export default router;