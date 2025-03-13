const StudentInfo = require('../model/StudentInfo');

class StudentInfoController {
    getAllStudentInfo = async () => {
        return await StudentInfo.findAll();
    }

    getStudentInfoById = async (id) => {
        return await StudentInfo.findByPk(id);
    }

    createStudentInfo = async (data) => {
        return await StudentInfo.create(data);
    }

    updateStudentInfo = async (id, data) => {
        if (await StudentInfo.update(data, { where: { id } })) {
            return await StudentInfo.findByPk(id);
        }
        return null;
    }

    deleteStudentInfo = async (id) => {
        if (await StudentInfo.destroy({ where: { id } })) {
            return true;
        }
        return false;
    }
}

module.exports = new StudentInfoController;