const datas = require('../database/database');
const { format } = require('date-fns');

let accountId = 1

const listAccounts = (req, res) => {

    return res.json(datas.accounts);
}

const createAccount = (req, res) => {
    const { name, cpf, date_of_birth, phone, email, password } = req.body;

    const cpfExists = datas.accounts.some((account) => {
        return account.user.cpf === cpf;
    })

    const emailExists = datas.accounts.some((account) => {
        return account.user.email === email;
    })

    if (cpfExists || emailExists) {
        return res.status(400).json({ message: "An account with the provided CPF or email already exists!" })
    }

    const newAccount = {
        number: accountId,
        balance: 0,
        user: {
            name,
            cpf,
            date_of_birth,
            phone,
            email,
            password
        }
    }

    datas.accounts.push(newAccount);

    accountId++

    return res.status(201).json();
}

const updateUser = (req, res) => {
    const { accountNumber } = req.params;
    const { name, cpf, date_of_birth, phone, email, password } = req.body;

    const account = datas.accounts.find((account) => {
        return account.number === Number(accountNumber);
    })

    if (!account) {
        return res.status(404).json({ message: "Account not found." });
    }

    const cpfExists = datas.accounts.some((account) => {
        return account.user.cpf === cpf;
    })

    const emailExists = datas.accounts.some((account) => {
        return account.user.email === email;
    })

    if (cpfExists) {
        return res.status(400).json({ message: "An account with the provided CPF already exists!" });
    }

    if (emailExists) {
        return res.status(400).json({ message: "An account with the provided email already exists!" })
    }

    account.user.name = name
    account.user.cpf = cpf
    account.user.date_of_birth = date_of_birth
    account.user.phone = phone
    account.user.email = email
    account.user.password = password

    res.status(200).json();
}

const deleteAccount = (req, res) => {
    const { accountNumber } = req.params;

    const account = datas.accounts.find((account) => {
        return account.number === Number(accountNumber);
    })

    if (!account) {
        return res.status(404).json({ message: "Account not found." });
    }

    if (account.balance !== 0) {
        return res.status(400).json({ message: "The account can only be deleted if the balance is zero!" });
    }

    const accountIndex = datas.accounts.findIndex(account => account.number === Number(accountNumber))
    datas.accounts.splice(accountIndex, 1);

    return res.json();
}

const deposit = (req, res) => {
    const { account_number, value } = req.body;

    if (!account_number || !value) {
        return res.status(400).json({ message: "Account number and value are mandatory!" });
    }

    const account = datas.accounts.find((account) => {
        return account.number === Number(account_number);
    })

    if (!account) {
        return res.status(404).json({ message: "Account not found." });
    }

    if (value <= 0 || isNaN(value)) {
        return res.status(404).json({ message: "This deposit is invalid." });
    }

    const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    let accountBalance = account.balance + value;
    account.balance = accountBalance;

    const newDeposit = {
        date,
        account_number,
        value
    }

    datas.deposits.push(newDeposit);

    return res.json();
}

const withdraw = (req, res) => {
    const { account_number, value, password } = req.body;

    if (!account_number || !value || !password) {
        return res.status(400).json({ message: "Account number, value, and password are mandatory!" });
    }

    const account = datas.accounts.find((account) => {
        return Number(account.number) === Number(account_number);
    })

    if (!account) {
        return res.status(404).json({ message: "Account not found." });
    }

    if (value <= 0 || isNaN(value)) {
        return res.status(400).json({ message: "The value cannot be less than zero!" });
    }

    if (value > account.balance) {
        return res.status(400).json({ message: "Insufficient balance!" });
    }

    if (password !== Number(account.user.password)) {
        return res.status(400).json({ message: "Invalid password." });
    }

    const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    account.balance -= value;

    const newWithdrawal = {
        date,
        account_number,
        value
    }

    datas.withdrawals.push(newWithdrawal);

    return res.json();
}

const transfer = (req, res) => {
    const { origin_account_number, destination_account_number, value, password } = req.body;

    if (!origin_account_number || !destination_account_number) {
        return res.status(400).json({ message: "Origin and destination account numbers are mandatory" });
    }

    const originAccount = datas.accounts.find((account) => {
        return account.number === Number(origin_account_number);
    })

    const destinationAccount = datas.accounts.find((account) => {
        return account.number === Number(destination_account_number);
    })

    if (!originAccount) {
        return res.status(404).json({ message: "Origin account not found." });
    }

    if (!destinationAccount) {
        return res.status(404).json({ message: "Destination account not found." });
    }

    if (!value || !password) {
        return res.status(400).json({ message: "Value and password are mandatory" });
    }

    if (value > originAccount.balance) {
        return res.status(400).json({ message: "Insufficient balance!" });
    }

    const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    originAccount.balance -= value;
    destinationAccount.balance += value;

    const newTransfer = {
        date,
        origin_account_number,
        destination_account_number,
        value
    }

    datas.transfers.push(newTransfer);

    return res.json();
}

const accountBalance = (req, res) => {
    const { account_number, password } = req.query;

    if (!account_number || !password) {
        return res.status(400).json({ message: "Account number and password are mandatory!" });
    }

    const account = datas.accounts.find((account) => {
        return account.number === Number(account_number);
    })

    if (!account) {
        return res.status(404).json({ message: "Account not found!" });
    }

    if (password !== account.user.password) {
        return res.status(400).json({ message: "Invalid password." });
    }

    const response = {
        balance: account.balance
    }

    return res.json(response);
}

const accountStatement = (req, res) => {
    const { account_number, password } = req.query;

    if (!account_number || !password) {
        return res.status(400).json({ message: "Account number and password are mandatory!" });
    }

    const account = datas.accounts.find((account) => {
        return account.number === Number(account_number);
    })

    if (!account) {
        return res.status(404).json({ message: "Account not found!" });
    }

    if (password !== account.user.password) {
        return res.status(400).json({ message: "Invalid password." });
    }

    const sentTransfers = datas.transfers.filter((transfer) => {
        return transfer.origin_account_number === Number(account_number);
    });

    const receivedTransfers = datas.transfers.filter((transfer) => {
        return transfer.destination_account_number === Number(account_number);
    });

    const deposits = datas.deposits.filter((deposit) => {
        return deposit.account_number === Number(account_number);
    });

    const withdrawals = datas.withdrawals.filter((withdrawal) => {
        return withdrawal.account_number === Number(account_number);
    });

    const statement = { deposits, withdrawals, sentTransfers, receivedTransfers }

    return res.json(statement);
}

module.exports = {
    listAccounts,
    createAccount,
    updateUser,
    deleteAccount,
    deposit,
    withdraw,
    transfer,
    accountBalance,
    accountStatement
}