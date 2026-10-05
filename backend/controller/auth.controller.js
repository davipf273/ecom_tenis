const Usuario = require('../models/Usuario')

const crypto = require('crypto-js')
const CHAVE_SECRETA = 'chave_secreta'

const login = async (req, res) => {
    const valores = req.body

    if(!valores.email || !valores.senha){
        return res.status(400).json({message: 'Email e senha são obrigatórios!'})
}

    try{
        const usuario = await Usuario.findOne({where: { email: valores.email}})

        if(!usuario){
            return res.status(404).json({message: 'Usuário não encontrado!'})
        }

        const bytes = crypto.AES.decrypt(usuario.senha, CHAVE_SECRETA)
        const senha = bytes.toString(crypto.enc.Utf8)

        if(senha !== valores.senha){
            return res.status(401).json({message: 'Senha incorreta!,nao autorizado'})
        }

        const horasEMS = 1.5 * 60 * 60 * 1000
        const tempoExpirar = new Date(Date.now() + horasEMS)

        const payload = {
            codUsuario: usuario.codUsuario,
            nome: usuario.nome,
            expiraEm: tempoExpirar
        }
        const token = crypto.AES.encrypt(JSON.stringify(payload), CHAVE_SECRETA).toString()

        return res.status(200).json({
            message: 'Login realizado com sucesso!',
            nome: usuario.nome,
            token: token,
        })
    }catch(err){
        console.error('Não foi possível realizar o login',err)
        res.status(500).json({message: 'Não foi possível realizar o login'})
    }
}

module.exports = { login }