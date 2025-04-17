const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = {
  async login(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email u00e9 obrigatu00f3rio' });
      }
      
      // Verificar se o email estu00e1 na wishlist
      const wishlistEntry = await prisma.wishlist.findUnique({
        where: { email }
      });
      
      if (!wishlistEntry) {
        return res.status(401).json({ error: 'Email nu00e3o autorizado. Solicite acesso u00e0 wishlist.' });
      }
      
      // Verificar se o usuu00e1rio ju00e1 existe
      let user = await prisma.user.findUnique({
        where: { email }
      });
      
      // Se nu00e3o existir, criar um novo usuu00e1rio
      if (!user) {
        user = await prisma.user.create({
          data: { email }
        });
      }
      
      // Gerar token JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '7d'
      });
      
      return res.json({
        user: {
          id: user.id,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao realizar login' });
    }
  }
};