const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()
const jsonParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})

bookmarksRouter
  .route('/api/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    const { title, url, description, rating } = req.body

    const ratingNum = Number(rating)

    if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).send({
        error: { message: `'rating' must be a number between 0 and 5` }
      })
    }

    if (!isWebUri(url)) {
      return res.status(400).send({
        error: { message: `'url' must be a valid URL` }
      })
    }

    const newBookmark = { title, url, description, rating }

    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/api/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark))
      })
      .catch(next)
  })

bookmarksRouter
  .route('/api/bookmarks/:bookmark_id')
  .all((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark Not Found` }
          })
        }
        res.bookmark = bookmark
        next()
      })
      .catch(next)
  })
  .get((req, res) => {

    res.json(serializeBookmark(res.bookmark))
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      bookmark_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

    .patch(jsonParser, (req, res, next) => {
         const { title, url, rating, description } = req.body
         const bookmarkToUpdate = { title, url, rating, description }

         const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
            if (numberOfValues === 0) {
              return res.status(400).json({
                error: {
                  message: `Request body must contain either 'title', 'url', 'rating', or 'description'`
                }
              })
            }

         BookmarksService.updateBookmark(
               req.app.get('db'),
               req.params.bookmark_id,
               bookmarkToUpdate
             )
               .then(numRowsAffected => {
                 res.status(204).end()
               })
               .catch(next)
     })

module.exports = bookmarksRouter