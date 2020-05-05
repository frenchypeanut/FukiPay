"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var QRCode = require('qrcode');
var Web3 = require('web3');
var contract_1 = require("./contract");
/**
 * @dev Check if the user have already a wallet.
 * @param idNumber Id of the user.
 * @return boolean The confirmation of the existence of the wallet.
 */
var checkNewWallet = function (idNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var address;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract_1.getWalletAddress(idNumber)];
            case 1:
                address = _a.sent();
                if (address === '0x0000000000000000000000000000000000000000') {
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
        }
    });
}); };
/**
 * @dev Give the string version of a int
 * @param value int to transform
 * @return string tne string version of the int
 */
var IntToSting = function (value) {
    return value.toString();
};
/**
 * @dev Give the url of the transaction.
 * @param tx Id of the transaction
 * @return string The url of the transaction.
 */
exports.getEtherscanUrl = function (tx) {
    var msg = 'you can find the details of your transaction at this url: https:///ropsten.etherscan.io/tx/' + tx;
    return msg;
};
/**
 * @dev Generate new smart-wallet.
 * @param idNumber Id of the user.
 * @return string The address of the new wallet.
 */
exports.getNewWallet = function (idNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var id, address;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = IntToSting(idNumber);
                if (!checkNewWallet(id)) return [3 /*break*/, 2];
                return [4 /*yield*/, contract_1.createWallet(id)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: return [4 /*yield*/, contract_1.getWalletAddress(id)];
            case 3:
                address = _a.sent();
                return [2 /*return*/, 'You already have a smart-wallet wich is : ' + address];
        }
    });
}); };
/**
 * @dev Get the address of the user's wallet.
 * @param idNumber Id of the user.
 * @return string The address of the user's wallet.
 */
exports.getWallet = function (idNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var id, address;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = IntToSting(idNumber);
                if (checkNewWallet(id)) {
                    return [2 /*return*/, "You don't have a smart-wallet."];
                }
                return [4 /*yield*/, contract_1.getWalletAddress(id)];
            case 1:
                address = _a.sent();
                return [2 /*return*/, 'Your smart-wallet address is : ' + address];
        }
    });
}); };
/**
 * @dev Get the address of the user's wallet in qrcode format.
 * @param idNumber Id of the user.
 * @return string The url of the qrcode.
 */
exports.getQRcode = function (idNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var id, address;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = IntToSting(idNumber);
                if (checkNewWallet(id)) {
                    return [2 /*return*/, "you don't have a wallet yet, if you want to, type the following command: "];
                }
                return [4 /*yield*/, contract_1.getWalletAddress(id)];
            case 1:
                address = _a.sent();
                QRCode.toDataURL(address, function (url, err) {
                    if (err) {
                        return err;
                    }
                    return url;
                });
                return [2 /*return*/];
        }
    });
}); };
/**
 * @dev Get the balance's user.
 * @param idNumber Id of the user.
 * @return int The value of the wallet's user.
 */
exports.getBalance = function (idNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var id, address;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = IntToSting(idNumber);
                if (checkNewWallet(id)) {
                    return [2 /*return*/, "you don't have a wallet yet, if you want to, type the following command: "];
                }
                return [4 /*yield*/, contract_1.getWalletAddress(id)];
            case 1:
                address = _a.sent();
                return [4 /*yield*/, Web3.eth.getBalance(address)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
