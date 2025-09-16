const fs = require("fs/promises");
const { Op, where } = require("sequelize");
const path = require("path");
const { File, Folder, FolderClosure } = require("../models");
const { imageSize } = require("image-size");
const dayjs = require("dayjs");
const { Json } = require("sequelize/lib/utils");

function delay(ms = 1000) {
  return new Promise((res) => setTimeout(res, ms));
}

// 文件上传,支持多文件，单文件
exports.uploadFiles = async (ctx) => {
  const { folder_id } = ctx.request.body;
  const files = ctx.request.files.files;
  if (files == undefined) {
    ctx.status = 403;
    ctx.body = {
      message: "请先选择",
    };
    return false;
  }
  const fileArray = Array.isArray(files) ? files : [files]; //多图是数组，单图是对象，单张图转为数组
  console.log(fileArray, "2222222222");

  const successFiles = [];
  const failedFiles = [];
  for (let file of fileArray) {
    try {
      console.log("上传中：", file.originalFilename);
      const type = file.mimetype.split("/")[0];
      await delay();
      const reader = require("fs").createReadStream(file.filepath);
      const ext = path.extname(file.originalFilename);
      const fileName = `${type}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${dayjs().format("YYYYMMDDHHmmss")}${ext}`;
      const rootPath = process.cwd(); //获取根路径
      const filePath = path.join(rootPath, `uploads/temp/`, fileName);
      const upStream = require("fs").createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        reader.pipe(upStream);
        upStream.on("finish", resolve);
        upStream.on("error", reject);
      });
      console.log("文件上传成功： ", file.originalFilename);
      let dimensions = {};
      if (file.mimetype.startsWith("image")) {
        const buffer = require("fs").readFileSync(file.filepath);
        dimensions = imageSize(buffer);
        console.log("dimensions: ", dimensions);
      }

      const image = await File.create({
        url: `http://localhost:9920/uploads/temp/${fileName}`,
        name: file.originalFilename,
        size: file.size,
        mime_type: file.mimetype,
        width: dimensions?.width,
        height: dimensions?.height,
        folder_id: folder_id,
      });
      console.log(fileName, "fileName");
      successFiles.push({
        url: `http://localhost:9920/uploads/temp/${fileName}`,
        fileName: file.originalFilename,
        size: file.size,
        id: image.id,
      });
    } catch (error) {
      console.error("文件上传失败： ", file.originalFilename, error.message);
      failedFiles.push({
        fileName: file.originalFilename,
        size: file.size,
        error: error.message,
      });
    }
  }
  ctx.body = {
    code: 200,
    message: "上传成功",
    data: {
      success: successFiles,
      failed: failedFiles,
    },
  };
};

exports.uploadFile = async (ctx) => {
  const file = ctx.request.files.files;
  console.log(file);
  try {
    console.log("上传中：", file.originalFilename);
    await delay();
    const reader = require("fs").createReadStream(file.filepath);
    const ext = path.extname(file.originalFilename);
    const fileName = `img_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    const rootPath = process.cwd(); //获取根路径
    const filePath = path.join(rootPath, `uploads/temp/`, fileName);
    const upStream = require("fs").createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      reader.pipe(upStream);
      upStream.on("finish", resolve);
      upStream.on("error", reject);
    });
    console.log("文件上传成功： ", file.originalFilename);
    const image = await File.create({
      url: `http://localhost:9920/uploads/temp/${fileName}`,
      name: file.originalFilename,
      size: file.size,
      mime_type: file.mimetype,
      folder_id: 2,
    });
    ctx.body = {
      code: 200,
      message: "上传成功",
      data: {
        url: `http://localhost:9920/uploads/temp/${fileName}`,
        fileName: file.originalFilename,
        size: file.size,
        id: image.id,
      },
    };
  } catch (error) {
    console.error("文件上传失败： ", file.originalFilename, error.message);
    ctx.body = {
      code: 400,
      message: "上传失败",
    };
  }
};

exports.deleteFile = async (ctx) => {
  const fileName = ctx.request.body.url;
  const rootPath = process.cwd(); //获取根路径
  console.log(rootPath, fileName);
  const filePath = path.join(rootPath, `uploads/temp/`, fileName);
  try {
    await delay();
    await fs.unlink(filePath);
    await File.destroy({
      where: {
        id: ctx.request.body.image_id,
      },
    });
    console.log("删除成功：", fileName);
    ctx.body = {
      code: 200,
      message: "删除成功",
    };
  } catch (error) {
    console.log("删除失败：", fileName);
    setTimeout(() => {
      ctx.body = {
        code: 500,
        message: "删除失败",
      };
    }, 1000);
  }
};

exports.folderInfo = async (ctx) => {
  const { path = "" } = ctx.params;
  console.log(path, "folderInfo", path.split(",").join("/"));

  try {
    const folder = await Folder.findOne({
      where: { path: "/" + path.split(",").join("/") },
    });
    console.log(folder, "folderInfo folder");
    const id = folder.id;

    const folders = await Folder.findAll({
      where: {
        parent_id: id,
      },
      order: [["createdAt", "ASC"]],
      include: [{ model: File }, { model: Folder, as: "children" }],
    });

    const files = await File.findAll({
      where: { folder_id: id },
      order: [["createdAt", "DESC"]],
    });

    const allChildren = await Folder.findAll({
      include: [
        {
          model: FolderClosure,
          as: "ancestors",
          where: {
            ancestor_id: id,
            depth: [0, 1],
          },
        },
      ],
    });

    // 导航
    const folder_list = await Folder.findAll({
      include: [
        {
          model: FolderClosure,
          as: "descendants",
          where: {
            descendant_id: id,
          },
        },
      ],
    });

    const folder_list2 = await Folder.findAll({
      where: {
        id: {
          [Op.not]: id,
        },
      },
      attributes: {
        exclude: ["descendants", "createdAt", "updateAt"],
      },
    });

    // console.log(folders, files, allChildren)
    ctx.body = {
      code: 200,
      message: "查询成功",
      data: { folders, files, folder_list, allChildren, folder_list2 },
    };
  } catch (err) {
    console.log(err);
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: "查询失败",
    };
  }
};

exports.addFolder = async (ctx) => {
  console.log(ctx.request.body, "addFolder");
  const { parent, name } = ctx.request.body;
  const folderName = name || "Default";
  try {
    folderPath = parent ? `${parent}/${folderName}` : `/${folderName}`;
    const f = await Folder.findOne({
      where: { path: folderPath },
    });

    if (f) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "文件夹已存在",
      };
      return;
    }

    const parentFolder = await Folder.findOne({ where: { path: parent } });
    const path = parentFolder?.path
      ? parentFolder.path + `/${folderName}`
      : `/${folderName}`;
    const folder = await Folder.create({
      name: folderName,
      parent_id: parentFolder?.id ? parentFolder.id : null,
      path: path,
    });

    // 创建关系
    const parentClosures = await FolderClosure.findAll({
      where: { descendant_id: parentFolder?.id ? parentFolder.id : null },
    });

    const newClosures = parentClosures.map((row) => {
      return {
        ancestor_id: row.ancestor_id,
        descendant_id: folder.id,
        depth: row.depth + 1,
      };
    });

    newClosures.push({
      ancestor_id: folder.id,
      descendant_id: folder.id,
      depth: 0,
    });

    await FolderClosure.bulkCreate(newClosures);

    ctx.body = {
      code: 200,
      message: "创建成功",
      data: folder,
    };
  } catch (err) {
    console.log(err);
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: "创建失败",
    };
  }
};

exports.getRootFolder = async (ctx) => {
  try {
    console.log(ctx.query, "querrrrrrrrrrrrrrrry");
    const parent_id = ctx.query?.id ? ctx.query.id : null;
    const folders = await Folder.findAll({
      where: {
        parent_id: parent_id,
      },
    });

    const foldersWidthChildren = await Promise.all(
      folders.map(async (folder) => {
        const f = await Folder.findAll({
          where: {
            parent_id: folder.id,
          },
        });
        const data = {
          ...folder.toJSON(),
        };
        if (f.length > 0) {
          data["children"] = [];
        }
        return data;
      })
    );
    console.log(foldersWidthChildren, '当前目录')
    ctx.body = {
      code: 200,
      message: "查询成功",
      data: foldersWidthChildren,
    };
  } catch (err) {
    console.log(err);
  }
};

exports.deleteFilesAndFolder = async (ctx) => {
  const { folders, files, urls } = ctx.request.body;
  console.log(folders, files, urls, "zhes");
  try {
    // 删除记录
    console.log("删除文件", await File.destroy({ where: { id: files } }));
    const rootPath = process.cwd(); //获取根路径
    // 删除文件
    urls.forEach(async (fileName) => {
      const filePath = path.join(rootPath, `uploads/temp/`, fileName);
      await fs.unlink(filePath);
      console.log("删除文件:", filePath);
    });

    // 删除目录
    await Folder.destroy({ where: { id: folders } });
    // 删除关系
    await FolderClosure.destroy({ where: { descendant_id: folders } });

    ctx.body = {
      code: 200,
      message: "删除成功",
    };
  } catch (err) {
    console.log(err);
  }
};

// move
exports.move = async (ctx) => {
  const { files, folder_id, id } = ctx.request.body;
  console.log(files, folder_id, id, '移动');
  // 移动文件夹
  try {
    await File.update(
      {
        folder_id: id,
      },
      {
        where: {
          id: files,
        },
      }
    );

    ctx.body = {
      code: 200,
      message: '移动成功'
    }

  }catch  (err){
    console.log(err, 错误);
    ctx.status = 403
    ctx.body = {
      message: '移动失败'
    }
  }

};
