import { insertRecords, insertTanks } from './insertRecords'
import { editRecords, updateTankInfo, activateTanks } from './editRecords'
import { deleteRecords } from './deleteRecords'
import {
  getPaginatedReadings,
  getDataUsingDate,
  getRecordById,
  getAllTankInfo,
  getTankById,
  getTotalNumberOfPages,
  getLastWeekData,
  getTodaysReadings,
  getFirstRecordYear
} from './readRecord'

export {
  insertRecords,
  insertTanks,
  editRecords,
  deleteRecords,
  getPaginatedReadings,
  getDataUsingDate,
  getRecordById,
  getAllTankInfo,
  getTankById,
  updateTankInfo,
  getTotalNumberOfPages,
  activateTanks,
  getLastWeekData,
  getTodaysReadings,
  getFirstRecordYear
}
