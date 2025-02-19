const e = require("express");
const { prisma } = require("../prisma/prisma-client");
const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');

const UserController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;
        console.log(email, password, name);
        if(!email || !password || !name) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        try {
            const isExistUser = await prisma.user.findUnique({
                where: { email}
            })

            if(isExistUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const png = jdenticon.toPng(name, 200);
            const avatarName = `${name}_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarPath}`,
                }
            })

            res.json(user);

        } catch(err) {
            console.error('Error in register', err);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    login: async (req, res) => {
        // Implement login logic here
        res.send('User logged in successfully');
    },
    getUserById: async (req, res) => {
        // Implement retrieving user by ID logic here
        res.send(`User with ID ${req.params.id} retrieved successfully`);
    },
    updateUser: async (req, res) => {
        // Implement updating user logic here
        res.send(`User with ID ${req.params.id} updated successfully`);
    },
    current: async (req, res) => {
        // Implement retrieving current user logic here
        res.send('Current user retrieved successfully');
    }
};

module.exports = UserController;