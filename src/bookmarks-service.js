const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks')
    },
    insertBookmark(knex, newBookmark) {
        return knex 
            .insert(newBookmarke)
            .into('bookmarks')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
           return knex.from('bookmarks').select('*').where('id', id).first()
         },

    deleteBookmarks(knex, id) {
    return knex('bookmarks')
        .where({ id })
        .delete()
    },

    updateBookmark(knex, id, newBookmarkFields) {
           return knex('bookmarks')
             .where({ id })
             .update(newArticleFields)
         },
}
    

module.exports = BookmarksService