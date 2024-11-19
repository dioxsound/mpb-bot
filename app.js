import "dotenv/config";
import { Telegram } from "puregram";
import { HearManager } from "@puregram/hear";

import DatabaseManager from "./database_manager/database_manager.js"

import CasinoWheelModel from "./casino_wheel/casino_wheel_model.js";
import WheelTransactionModel from "./casino_wheel/wheel_transaction_model.js";
import BookmakerModel from "./bookmaker/bookmaker_model.js";

import UsernameModel from "./username/username_model.js";
import UserProfileModel from "./user_profile/user_profile_model.js";

import BankProfileModel from "./bank/bank_profile/bank_profile_model.js";
import BankTransferModel from "./bank/bank_transfer/bank_transfer_model.js";

const telegram = Telegram.fromToken(process.env.BOT_TOKEN);
const hearManager = new HearManager();

telegram.updates.on("message", hearManager.middleware);
/*  Команды для инициализации бд
 *  Команды для инициализации бд
 */
hearManager.hear("!дроп", DatabaseManager.removeTables);
hearManager.hear("!инит", DatabaseManager.createTables);
/*  Команды для казино
 *  Команды для казино
 */
hearManager.hear(/^казино(?:\s+(.+))?$/i, CasinoWheelModel.handleCasinoCommand);
hearManager.hear(/^пополнить казино(?:\s+(.+))?$/i, WheelTransactionModel.handleDepositCommand);
hearManager.hear(/^вывести казино(?:\s+(.+))?$/i, WheelTransactionModel.handleWithdrawCommand);
hearManager.hear(/^букмекер(?:\s+(.+))?$/i, BookmakerModel.chooseBookmaker);
/*  Команды для просмотра профиля
 *  Команды для просмотра профиля
 */
hearManager.hear(/^никнейм(?:\s+(.+))?$/i, UsernameModel.changeUsername);
hearManager.hear(/^профиль(?:\s+(.+))?$/i, UserProfileModel.viewUserProfile);
/*  Команды для банка
 *  Команды для банка
 */
hearManager.hear(/^банк(?:\s+(.+))?$/i, BankProfileModel.viewBankProfile);
hearManager.hear(/^перевести(?:\s+(.+))?$/i, BankTransferModel.transferMoney);

telegram.updates.startPolling();
