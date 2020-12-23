'use strict';

const {Router} = require(`express`);

const {HTTP_CODE} = require(`../constants`);
const articleExists = require(`../middlewares/article-exists`);
const articleValidator = require(`../middlewares/article-validator`);
const commentValidator = require(`../middlewares/comment-validator`);

module.exports = (articleService, commentService) => {
  const articleRouter = new Router();

  articleRouter.get(`/`, async (req, res) => {
    const articles = articleService.getAll();
    res.status(HTTP_CODE.OK).json(articles);
  });
  articleRouter.get(`/:articleId`, articleExists(articleService), async (req, res) => {
    res.status(HTTP_CODE.OK).json(res.locals.article);
  });
  articleRouter.post(`/`, articleValidator, async (req, res) => {
    const createdOffer = articleService.create(req.body);
    res.status(HTTP_CODE.CREATED).json(createdOffer);
  });
  articleRouter.put(`/:articleId`, [articleExists(articleService), articleValidator], async (req, res) => {
    const {articleId} = req.params;
    const updatedArticle = articleService.update(articleId, req.body);
    res.status(HTTP_CODE.OK).json(updatedArticle);
  });
  articleRouter.delete(`/:articleId`, articleExists(articleService), async (req, res) => {
    const {articleId} = req.params;
    articleService.delete(articleId);
    res.status(HTTP_CODE.OK).json(res.locals.article);
  });

  // comments
  articleRouter.get(`/:articleId/comments`, articleExists(articleService), async (req, res) => {
    const {article} = res.locals;
    const comments = commentService.getAll(article);
    res.status(HTTP_CODE.OK).json(comments);
  });
  articleRouter.delete(`/:articleId/comments/:commentId`, articleExists(articleService), async (req, res) => {
    const {article} = res.locals;
    const {commentId} = req.params;
    const deletedComment = commentService.delete(article, commentId);
    res.status(HTTP_CODE.OK).json(deletedComment);
  });
  articleRouter.post(`/:articleId/comments`, [articleExists(articleService), commentValidator], async (req, res) => {
    const {article} = res.locals;
    const createdComment = commentService.create(article, req.body);
    res.status(HTTP_CODE.CREATED).json(createdComment);
  });

  return articleRouter;
};


