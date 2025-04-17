const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  async addToWishlist(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }
      
      // Verificar se o email já está na wishlist
      const existingEntry = await prisma.wishlist.findUnique({
        where: { email }
      });
      
      if (existingEntry) {
        return res.status(400).json({ error: 'Email já está na wishlist' });
      }
      
      // Adicionar email à wishlist
      const wishlistEntry = await prisma.wishlist.create({
        data: { email }
      });
      
      return res.status(201).json({
        message: 'Email adicionado à wishlist com sucesso',
        email: wishlistEntry.email
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao adicionar email à wishlist' });
    }
  }
};