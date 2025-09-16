const { Op, where } = require("sequelize");
const { Topic, Comment, Downvote } = require("../models");

exports.addTopic = async (ctx) => {
  console.log(ctx.request.body);
  const data = ctx.request.body;
  const topic = await Topic.create({
    title: data.title,
    content: data.text,
    author: data.username,
    cover: data.uploadImg,
    images: data.uploadImgs,
    tags: data.keywords.join(","),
    anonymity: data.isNiMing,
    showID: data.isShowID,
  });
  await Comment.create({
    content: data.text,
    author: data.username,
    cover: data.uploadImg,
    index: 1,
    topicId: topic.id,
    images: data.uploadImgs,
    tags: data.keywords.join(","),
    anonymity: data.isNiMing,
    showID: data.isShowID,
  });
  ctx.body = {
    code: 200,
    message: "success",
    data: topic,
  };
};

exports.getTopics = async (ctx) => {
  console.log(ctx.query);
  const { page = 1, pageSize = 10, q = "" } = ctx.query;
  const { topics, count } = await getTopicList({ page, pageSize, q });
  ctx.body = {
    code: 200,
    message: "success",
    data: topics,
    total: count,
    page: page,
  };
};

async function getTopicList({ page = 1, pageSize = 10, q = "" }) {
  const pageNum = Number(page);
  const pageLimit = Number(pageSize);
  const offset = (pageNum - 1) * pageLimit;
  const whereClause = q ? { title: { [Op.substring]: q } } : undefined;
  // const [topics, count] = await Promise.all([
  //   Topic.findAll({
  //     where: whereClause,
  //     limit: pageLimit,
  //     offset: offset,
  //     order: [["createdAt", "DESC"]],
  //   }),
  //   Topic.count({ where: whereClause }),
  // ]);

  const { count, rows: topics } = await Topic.findAndCountAll({
    where: whereClause,
    limit: pageLimit,
    offset: offset,
    order: [["createdAt", "DESC"]],
  });

  topics.forEach((topic) => {
    topic.author = topic.anonymity ? "匿名" : topic.author;
  });

  return { topics, count, page: pageNum };
}

exports.getData = async (ctx) => {
  try {
    const { page = 1, pageSize = 10, q = "" } = ctx.query;
    const {
      topics,
      count,
      page: currentPage,
    } = await getTopicList({ page, pageSize, q });

    const hotTopics = await Topic.findAll({
      where: {
        hot: {
          [Op.ne]: null,
        },
      },
      limit: 5,
      order: [["hot", "DESC"]],
    });

    hotTopics.forEach((topic) => {
      topic.author = topic.anonymity ? "匿名" : topic.author;
    });

    ctx.body = {
      code: 200,
      message: "success",
      total: count,
      page: currentPage,
      data: {
        topics,
        hotTopics,
      },
    };
  } catch {
    console.error("GetData error:", err);
    ctx.body = {
      code: 500,
      message: "服务器异常，请稍后重试",
    };
  }
};

exports.topicDetail = async (ctx) => {
  const { id } = ctx.params;
  const { id: commentId = null } = ctx.query;
  try {
    let topic = null;
    let comments = null;
    if (commentId) {
      topic = await Topic.findOne({
        where: {
          id,
        },
        include: {
          model: Comment,
          as: "Comments",
          where: {
            id: commentId,
          },
          include: [Comment, Downvote],
        },
      });

       comments = await Comment.findAll({
        where: {
          topicId: id,
          parentCommentId: commentId,
        },
        include: [Comment, Downvote],
      });
    } else {
      topic = await Topic.findOne({
        where: {
          id,
        },
      });

       comments = await Comment.findAll({
        where: {
          topicId: id,
        },
        include: [Comment, {model: Comment, as: 'parentComment'}, Downvote],
      });

      
    }

    topic.author = topic.anonymity ? "匿名" : topic.author;

    comments.forEach((comment) => {
      comment.author = comment.anonymity ? "匿名" : comment.author;
    });

    ctx.body = {
      code: 200,
      message: "success",
      data: {
        topic,
        comments,
      },
    };
  } catch (err) {
    console.log(err);
  }
};

exports.addComment = async (ctx) => {
  const data = ctx.request.body;
  console.log(data, "dadddddddddddd");
  const { topicId, parentCommentId = null } = ctx.request.body;
  try {
    const lastComment = await Comment.findOne({
      where: {
        topicId: topicId,
      },
      order: [["createdAt", "DESC"]],
    });

    const comment = await Comment.create({
      content: data.text,
      author: data.username,
      cover: data.uploadImg,
      index: lastComment.index + 1,
      parentCommentId: parentCommentId,
      topicId: data.topicId,
      images: data.uploadImgs,
      anonymity: data.isNiMing,
      showID: data.isShowID,
    });
    ctx.body = {
      code: 200,
      message: "success",
      comment,
    };
  } catch (err) {
    console.log(err);
  }
};

exports.updateVote = async (ctx) => {
  const { id } = ctx.params;
  const { type } = ctx.request.body;

  console.log("love", type, ctx.ip);
  const comment = await Comment.findByPk(id);

  const downvote = await Downvote.findOne({
    where: {
      commentId: id,
      ip: ctx.ip,
    },
  });

  if (downvote) {
    return (ctx.body = {
      code: 401,
      message: "已经点过了",
    });
  }

  if (comment === null) {
    console.log("Not found!");
  } else {
    console.log(comment);
    await Downvote.create({
      commentId: id,
      ip: ctx.ip,
      type: type,
    });
    if (type == "love") {
      await comment.update({
        love: Number(comment.love) + 1,
      });
    } else {
      await comment.update({
        dislike: Number(comment.dislike) + 1,
      });
    }

    await comment.save();
    ctx.body = {
      code: 200,
      message: "success",
      data: {
        love: comment.love,
        dislike: comment.dislike,
      },
    };
  }
};
