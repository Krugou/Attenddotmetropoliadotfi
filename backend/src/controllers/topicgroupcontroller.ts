import { RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';
import TopicGroupModel from '../models/topicgroupmodel.js';
import TopicInGroupModel from '../models/topicingroupmodel.js';
import TopicModel from '../models/topicmodel.js';
import usercourse_topicsModel from '../models/usercourse_topicsmodel.js';
import UserModel from '../models/usermodel.js';

const pool = createPool('ADMIN');

// Helper: resolve user id by email or throw
async function getUserIdByEmail(email: string) {
  const user = await UserModel.getAllUserInfo(email);
  if (!user?.userid) {
    console.log('topicgroupcontroller.ts user not found or userid missing');
    throw new Error('User not found');
  }
  return user.userid as number;
}

const TopicGroupController = {
  // Fetch all topic groups and topics for a user
  async getAllUserTopicGroupsAndTopics(email: string) {
    try {
      console.log('topicgroupcontroller.ts getAllUserTopicGroupsAndTopics start');
      const user = await UserModel.getAllUserInfo(email);
      if (!user?.userid) {
        console.log('topicgroupcontroller.ts user not found');
        throw new Error('User not found');
      }
      const topicGroups = await TopicGroupModel.fetchAllTopicGroupsWithTopicsByUserId(user.userid);
      console.log('topicgroupcontroller.ts fetched topic groups');
      return topicGroups;
    } catch (error) {
      console.log('topicgroupcontroller.ts error in getAllUserTopicGroupsAndTopics');
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Create/update a topic group and ensure topics & relations
  async updateTopicGroup(topicGroup: string, topics: string[], email: string) {
    try {
      console.log('topicgroupcontroller.ts updateTopicGroup start');
      if (!email) throw new Error('Email is required');
      if (!topicGroup) throw new Error('Topic group is required');

      const instructorUserId = await getUserIdByEmail(email);

      // Create topic group
      const newTopicGroup = await TopicGroupModel.insertTopicGroup(topicGroup, instructorUserId);
      const topicGroupId = newTopicGroup.insertId;
      console.log(`topicgroupcontroller.ts created topic group '${topicGroup}' (id=${topicGroupId})`);

      // Upsert topics and relations
      if (topics?.length) {
        for (const topic of topics) {
          const existing = await TopicModel.checkIfTopicExists(topic);
          let topicId: number;
          if (existing && existing.length > 0) {
            console.warn(`topicgroupcontroller.ts topic '${topic}' already exists`);
            topicId = existing[0].topicid;
          } else {
            const created = await TopicModel.insertTopic(topic);
            if (!created) {
              console.log('topicgroupcontroller.ts failed to insert new topic');
              throw new Error('Failed to insert new topic');
            }
            topicId = created.insertId;
            console.log(`topicgroupcontroller.ts created topic '${topic}' (id=${topicId})`);
          }

          const rel = await TopicInGroupModel.checkIfTopicInGroupExists(topicGroupId, topicId);
          if (!rel || rel.length === 0) {
            await TopicInGroupModel.insertTopicInGroup(topicGroupId, topicId);
            console.log(`topicgroupcontroller.ts linked topic '${topic}' to group '${topicGroup}'`);
          } else {
            console.warn('topicgroupcontroller.ts topic group relation exists');
          }
        }
      }

      console.log('topicgroupcontroller.ts updateTopicGroup done');
      return {
        state: 'success',
        message: `Topic group entered for userid: ${instructorUserId} with topicgroupname: ${topicGroup}`,
        email,
      };
    } catch (error) {
      console.log('topicgroupcontroller.ts error in updateTopicGroup');
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Replace topics for a usercourse inside a transaction
  async updateUserCourseTopics(usercourseid: number, topics: string[]) {
    console.log('topicgroupcontroller.ts updateUserCourseTopics start');
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();
      console.log('topicgroupcontroller.ts transaction begun');

      await usercourse_topicsModel.deleteUserCourseTopic(usercourseid, connection);

      for (const topic of topics) {
        const [existingTopic] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM topics WHERE topicname = ?',
          [topic],
        );
        if (!existingTopic || existingTopic.length === 0) {
          console.log('topicgroupcontroller.ts topic does not exist');
          throw new Error('Topic does not exist');
        }
        await usercourse_topicsModel.insertUserCourseTopic(usercourseid, existingTopic[0].topicid, connection);
      }

      await connection.commit();
      console.log('topicgroupcontroller.ts transaction committed');
      return { state: 'success', message: `Topics updated for usercourseid: ${usercourseid}` };
    } catch (error) {
      console.log('topicgroupcontroller.ts error in updateUserCourseTopics, rolling back');
      await connection.rollback();
      console.error(error);
      return Promise.reject(error);
    } finally {
      connection.release();
      console.log('topicgroupcontroller.ts connection released');
    }
  },

  // Check if a topic group exists by email
  async checkIfTopicGroupExistsWithEmail(topicGroup: string, email: string) {
    try {
      console.log('topicgroupcontroller.ts checkIfTopicGroupExistsWithEmail start');
      if (!topicGroup) return false;
      const instructorUserId = await getUserIdByEmail(email);
      const existing = await TopicGroupModel.checkIfTopicGroupExists(topicGroup, instructorUserId);
      const exists = !!(existing && existing.length > 0);
      console.log(`topicgroupcontroller.ts topicGroup exists = ${exists}`);
      return exists;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Delete a topic group by name
  async deleteTopicGroupByName(topicGroup: string, userid: number | undefined) {
    try {
      const topicGroupData = await TopicGroupModel.deleteTopicGroupByName(topicGroup, userid);
      if (topicGroupData.affectedRows === 0) {
        console.log('topicgroupcontroller.ts topic group not found');
        throw new Error('Topic group not found');
      }
      console.log('topicgroupcontroller.ts topic group deleted');
      return topicGroupData;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default TopicGroupController;
