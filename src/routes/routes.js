const express = require('express');
const { checkPassword, checkData } = require('../middlewares/middlewares');
const { listAccounts, createAccount, updateUser, deleteAccount, deposit, withdraw, transfer, accountStatement, accountBalance } = require('../controllers/controllers');

const routes = express();
routes.get('/accounts', checkPassword, listAccounts);
routes.post('/accounts', checkData, createAccount);
routes.put('/accounts/:accountNumber/user', checkData, updateUser);
routes.delete('/accounts/:accountNumber', deleteAccount);

routes.post('/transactions/deposit', deposit);
routes.post('/transactions/withdraw', withdraw);
routes.post('/transactions/transfer', transfer);
routes.get('/accounts/balance', accountBalance);
routes.get('/accounts/statement', accountStatement);

module.exports = routes;