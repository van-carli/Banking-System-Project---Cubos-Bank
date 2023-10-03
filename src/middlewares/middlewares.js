const datas = require('../database/database');

const checkPassword = (req, res, next) => {
    const { bank_password } = req.query;

    if (!bank_password) {
        return res.status(400).json({ message: `Password is mandatory.` })
    }

    if (bank_password !== datas.bank.password) {
        return res.status(401).json({ message: "Provided bank password is invalid!" })
    }

    return next();
}

const checkData = (req, res, next) => {
    const { name, cpf, date_of_birth, phone, email, password } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name must be provided." });
    }

    if (!cpf) {
        return res.status(400).json({ message: "CPF must be provided." });
    }

    if (!date_of_birth) {
        return res.status(400).json({ message: "Date of birth must be provided." });
    }

    if (!phone) {
        return res.status(400).json({ message: "Phone must be provided." });
    }

    if (!email) {
        return res.status(400).json({ message: "Email must be provided." });
    }

    if (!password) {
        return res.status(400).json({ message: "Password must be provided." });
    }

    return next();
}

module.exports = {
    checkPassword,
    checkData
}