import {ResultSetHeader, RowDataPacket} from 'mysql2';
import practicum from '../models/practicummodels.js';
import practicumEntry from '../models/work_log_entrymodel.js';
import work_log_practicum_instructors from '../models/work_log_practicum_instructormodel.js';
import logger from '../utils/logger.js';


export interface PracticumCreate {
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  description: string;
  requiredHours: number;
  instructors?: {email: string}[];
}

export interface PracticumUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  required_hours?: number;
  instructors?: string[];
}

export interface PracticumDetails {
  practicum?: {
    instructor_name?: string;
    [key: string]: any;
  };
  entries?: any[];
};


const practicumController = {
  async createPracticum(practicumData: PracticumCreate) {
    try {
      const result = await practicum.createPracticum(
        practicumData.name,
        practicumData.startDate,
        practicumData.endDate,
        practicumData.description,
        practicumData.requiredHours,
      );

      const practicumId = result.insertId;

      if (practicumData.instructors?.length) {
        await work_log_practicum_instructors.addInstructorsToPracticum(
          practicumData.instructors,
          practicumId,
        );
      }

      return result;
    } catch (error) {
      logger.error('Error in createPracticum:', error);
      throw error;
    }
  },

  async getPracticumDetails(practicumId: number): Promise<PracticumDetails> {
    try {
      const practicumDetails = await practicum.getPracticumById(practicumId);
      const entries = await practicumEntry.getWorkLogEntriesByPracticum(
        practicumId,
      );
      const instructors = await work_log_practicum_instructors.getInstructorsByPracticum(
        practicumId,
      );

      return {
        practicum: {
          ...practicumDetails[0],
          instructor_name: instructors.map((i) => i.email).join(','),
        },
        entries,
      };
    } catch (error) {
      logger.error('Error in getPracticumDetails:', error);
      throw error;
    }
  },

  async updatePracticum(
    practicumId: number,
    updates: PracticumUpdate,
  ): Promise<ResultSetHeader> {
    try {
      const existingPracticum = await practicum.getPracticumById(practicumId);
      if (!existingPracticum?.length) {
        throw new Error('Practicum not found');
      }

      const practicumUpdateResult = await practicum.updatePracticum(practicumId, {
        name: updates.name,
        description: updates.description,
        start_date: updates.start_date,
        end_date: updates.end_date,
        required_hours: updates.required_hours,
      });

      if (updates.instructors && updates.instructors.length > 0) {
        await work_log_practicum_instructors.removeAllPracticumInstructors(practicumId);
        await work_log_practicum_instructors.addInstructorsToPracticum(
          updates.instructors.map((email) => ({email})),
          practicumId,
        );
      }

      return practicumUpdateResult;
    } catch (error) {
      logger.error('Error in updatePracticum:', error);
      throw error;
    }
  },

  async deletePracticum(practicumId: number): Promise<ResultSetHeader> {
    try {
      const result = await practicum.deletePracticum(practicumId);
      if (result.affectedRows === 0) {
        throw new Error('Practicum not found');
      }
      return result;
    } catch (error) {
      logger.error('Error in deletePracticum:', error);
      throw error;
    }
  },

  async getPracticumsByInstructor(userId: number): Promise<RowDataPacket[]> {
    try {
      return await work_log_practicum_instructors.getPracticumsByInstructor(userId);
    } catch (error) {
      logger.error('Error in getPracticumsByInstructor:', error);
      throw error;
    }
  },
};

export default practicumController;
