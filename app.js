import "dotenv/config";
import { Telegram } from "puregram";
import { HearManager } from "@puregram/hear";

import DatabaseManager from "./database/database_manager/database_manager.js";

import Casino from "./casino/casino_wheel/casino_wheel.js";
import CasinoBookmaker from "./casino/casino_bookmaker.js";

import UsernameModel from "./profile/username/username_model.js";
import ProfileModel from "./profile/profile_model.js";
import BankProfileModel from "./bank/bank_profile/bank_profile.js";

const telegram = Telegram.fromToken(process.env.BOT_TOKEN);
const hearManager = new HearManager();

telegram.updates.on("message", hearManager.middleware);
/*  Команды для инициализации бд
 *  Команды для инициализации бд
 */
hearManager.hear("!дроп", DatabaseManager.removeTables);
hearManager.hear("!инит", DatabaseManager.createTables);
/*  Команды для просмотра профиля
 *  Команды для просмотра профиля
 */
hearManager.hear(/^никнейм(?:\s+(.+))?$/i, UsernameModel.changeUsername);
hearManager.hear(/^профиль(?:\s+(.+))?$/i, ProfileModel.viewProfile);
hearManager.hear(/^банк(?:\s+(.+))?$/i, BankProfileModel.viewBankProfile);
/*  Команды для букмекера
 *  Команды для букмекера
 */
hearManager.hear(/^букмекер(?:\s+(.+))?$/i, CasinoBookmaker.chooseBookmaker);
/*  Команды для казино
 *  Команды для казино
 */
hearManager.hear(/^казино(?:\s+(.+))?$/i, Casino.handleCasinoCommand);
hearManager.hear(/^пополнить казино(?:\s+(.+))?$/i, Casino.handleDepositCommand);
hearManager.hear(/^вывести казино(?:\s+(.+))?$/i, Casino.handleWithdrawCommand);

telegram.updates.startPolling();
