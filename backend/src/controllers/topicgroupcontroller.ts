import {RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';
import TopicGroupModel from '../models/topicgroupmodel.js';
import TopicInGroupModel from '../models/topicingroupmodel.js';
import TopicModel from '../models/topicmodel.js';
import usercourse_topicsModel from '../models/usercourse_topicsmodel.js';
import UserModel from '../models/usermodel.js';

const pool = createPool('ADMIN');
const TopicGroupController = {
  /**
   * Fetches all topic groups and topics for a user.
   *
   * @param {string} email - The email of the user.
   * @returns {Promise<any>} The topic groups and topics of the user.
   */
  async getAllUserTopicGroupsAndTopics(email: string) {
    try {
      console.log("row 19, topicgroupcontroller.ts, getAllUserTopicGroupsAndTopics");
      const user = await UserModel.getAllUserInfo(email);
      console.log("row 21, topicgroupcontroller.ts, gets all the user info with email");
      if (!user) {
        console.log("row 23, topicgroupcontroller.ts, user not found");
        throw new Error('User not found');
      }
      const userid = user.userid;
      if (userid === undefined) {
        console.log("row 28, topicgroupcontroller.ts, user id is undefined");
        throw new Error('User id is undefined');
      }
      const topicGroups =
        await TopicGroupModel.fetchAllTopicGroupsWithTopicsByUserId(userid);
      console.log("row 33, topicgroupcontroller.ts, gets all topic groups with topics by userid");
      return topicGroups;
    } catch (error) {
      console.log("row 36, topicgroupcontroller.ts, error in getAllUserTopicGroupsAndTopics");
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates a topic group.
   *
   * @param {string} topicGroup - The name of the topic group.
   * @param {string[]} topics - The topics in the topic group.
   * @param {string} email - The email of the user.
   * @returns {Promise<any>} The result of the update operation.
   */
  async updateTopicGroup(topicGroup: string, topics: string[], email: string) {
    try {
      console.log("row 51, topicgroupcontroller.ts, Updating topic group");
      let instructorUserId;
      if (email) {
        console.log("row 54, topicgroupcontroller.ts, if email exists");
        const user = await UserModel.getAllUserInfo(email);
        console.log("row 56, topicgroupcontroller.ts, gets all the user info with email");
        if (!user) {
          console.log("row 58, topicgroupcontroller.ts, user not found");
          throw new Error('User not found');
        }
        instructorUserId = user.userid;
      }
      if (topicGroup) {
        console.log("row 64, topicgroupcontroller.ts, if topicGroup exists");
        let topicGroupId;
        if (instructorUserId !== undefined) {
          const newTopicGroup = await TopicGroupModel.insertTopicGroup(
            topicGroup,
            instructorUserId,
          );
          console.log("row 71, topicgroupcontroller.ts, creates new topic group");
          topicGroupId = newTopicGroup.insertId;
        } else {
          console.log("row 74, topicgroupcontroller.ts, instructorUserId is undefined");
          throw new Error('Instructor user ID is undefined');
        }

        if (topics) {
          console.log("row 79, topicgroupcontroller.ts, if topics exists");
          for (const topic of topics) {
            console.log("row 81, topicgroupcontroller.ts, looping through topics");
            let topicId;
            const existingTopic = await TopicModel.checkIfTopicExists(topic);
            console.log("row 84, topicgroupcontroller.ts, checks if topic exists");

            if (existingTopic && existingTopic.length > 0) {
              console.log("row 87, topicgroupcontroller.ts, if existing topic exists");
              console.error('Topic already exists');
              topicId = existingTopic[0].topicid;
            } else {
              const newTopic = await TopicModel.insertTopic(topic);
              console.log("row 92, topicgroupcontroller.ts, creates new topic");
              if (!newTopic) {
                console.log("row 94, topicgroupcontroller.ts, failed to insert new topic");
                throw new Error('Failed to insert new topic');
              }
              topicId = newTopic.insertId;
            }

            const topicGroupTopicRelationExists =
              await TopicInGroupModel.checkIfTopicInGroupExists(
                topicGroupId,
                topicId,
              );
            console.log("row 106, topicgroupcontroller.ts, checks if topic group topic relation exists");

            if (
              topicGroupTopicRelationExists &&
              topicGroupTopicRelationExists.length > 0
            ) {
              console.log("row 111, topicgroupcontroller.ts, if topic group topic relation exists");
              console.error('Topic group relation exists');
            } else {
              console.log("row 114, topicgroupcontroller.ts, if topic group topic relation does not exist");
              await TopicInGroupModel.insertTopicInGroup(topicGroupId, topicId);
              console.log("row 116, topicgroupcontroller.ts, runs insertTopicInGroup");
            }
          }
        }
      }
      console.log("row 121, topicgroupcontroller.ts, returns success state and message");
      return {
        state: 'success',
        message:
          'Topic group entered for userid: ' +
          instructorUserId +
          ' with topicgroupname: ' +
          topicGroup,
        email: email,
      };
    } catch (error) {
      console.log("row 132, topicgroupcontroller.ts, error: " + error);
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates the topics for a user course.
   *
   * @param {number} usercourseid - The ID of the user course.
   * @param {string[]} topics - The topics for the user course.
   * @returns {Promise<any>} The result of the update operation.
   */
  async updateUserCourseTopics(usercourseid: number, topics: string[]) {
    // Get a connection from the pool
    console.log("row 146, topicgroupcontroller.ts, updateusercoursetopics");
    const connection = await pool.promise().getConnection();

    try {
      await connection.beginTransaction();
      console.log("row 151, topicgroupcontroller.ts, begin connection transaction");

      // Delete all existing topics for the usercourseid
      await usercourse_topicsModel.deleteUserCourseTopic(
        usercourseid,
        connection,
      );
      console.log("row 158, topicgroupcontroller.ts, delete all existing topics for usercourseid");
      // Insert the new topics for the usercourseid
      console.log("row 160, topicgroupcontroller.ts, loop through topics");
      for (const topic of topics) {
        let topicId;
        console.log("row 163, topicgroupcontroller.ts, searching topic: " + topic);
        const [existingTopic] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM topics WHERE topicname = ?',
          [topic],
        );
        // If the topic exists, get the topicid
        if (existingTopic && existingTopic.length > 0) {
          console.log("row 170, topicgroupcontroller.ts, if topic exists");
          topicId = existingTopic[0].topicid;
        } else {
          console.log("row 173, topicgroupcontroller.ts, if topic does not exist");
          throw new Error('Topic does not exist');
        }
        // Insert the topic for the usercourseid
        await usercourse_topicsModel.insertUserCourseTopic(
          usercourseid,
          topicId,
          connection,
        );
      }
      // Commit the transaction
      console.log("row 184, topicgroupcontroller.ts, commit connection transaction");
      await connection.commit();
      // Return a success message
      return {
        state: 'success',
        message: 'Topics updated for usercourseid: ' + usercourseid,
      };
    } catch (error) {
      console.log("row 192, topicgroupcontroller.ts, error in updateUserCourseTopics");
      // Rollback the transaction if there is an error
      await connection.rollback();
      console.error(error);
      return Promise.reject(error);
    } finally {
      console.log("row 198, topicgroupcontroller.ts, connection released");
      connection.release();
    }
  },
  /**
   * Checks if a topic group exists for a user.
   *
   * @param {string} topicGroup - The name of the topic group.
   * @param {string} email - The email of the user.
   * @returns {Promise<boolean>} Whether the topic group exists for the user.
   */
  async checkIfTopicGroupExistsWithEmail(topicGroup: string, email: string) {
    try {
      console.log("row 211, topicgroupcontroller.ts, checkIfTopicGroupExistsWithEmail");
      let instructorUserId;
      if (email) {
        console.log("row 214, topicgroupcontroller.ts, if email exists");
        const user = await UserModel.getAllUserInfo(email);
        console.log("row 216, topicgroupcontroller.ts, gets all the user info with email");
        if (!user) {
          console.log("row 218, topicgroupcontroller.ts, user not found");
          throw new Error('User not found');
        }
        instructorUserId = user.userid;
      }
      if (topicGroup && instructorUserId) {
        console.log("row 224, topicgroupcontroller.ts, if topicGroup and instructorUserId exists");
        const existingTopicGroup =
          await TopicGroupModel.checkIfTopicGroupExists(
            topicGroup,
            instructorUserId,
          );
        console.log("row 230, topicgroupcontroller.ts, checks if topic group exists");
        if (existingTopicGroup && existingTopicGroup.length > 0) {
          console.log("row 232, topicgroupcontroller.ts, if existing topic group exists returns true");
          return true;
        }
      }
      console.log("row 236, topicgroupcontroller.ts, if existing topic group does not exist returns false");
      return false;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Deletes a topic group by its name.
   *
   * @param {string} topicGroup - The name of the topic group.
   * @param {number | undefined} userid - The ID of the user.
   * @returns {Promise<any>} The result of the delete operation.
   */
  async deleteTopicGroupByName(topicGroup: string, userid: number | undefined) {
    try {
      const topicGroupData = await TopicGroupModel.deleteTopicGroupByName(
        topicGroup,
        userid,
      );
      console.log("row 256, topicgroupcontroller.ts, deleteTopicGroupByName");
      // console.log(
      // 	'🚀 ~ file: topicgroupcontroller.ts:172 ~ deleteTopicGroupByName ~ topicGroupData:',
      // 	topicGroupData,
      // );
      if (topicGroupData.affectedRows === 0) {
        console.log("row 262, topicgroupcontroller.ts, if topicGroupData affectedRows is 0");
        throw new Error('Topic group not found');
      }

      console.log("row 266, topicgroupcontroller.ts, returns topicGroupData");
      return topicGroupData;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default TopicGroupController;
