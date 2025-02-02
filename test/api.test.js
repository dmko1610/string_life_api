const chai = require("chai")
const request = require("supertest")
const { app, db } = require('../src/server')

chai.should()

let server

before((done) => {
  process.env.NODE_ENV = 'test'
  server = app.listen(4000, () => done())
})

after((done) => {
  server.close(() => done())
})

beforeEach((done) => {
  db.serialize(() => {
    db.run("DELETE FROM stringLife", done)
  })
})

describe("API Tests", () => {
  it('should get all items', (done) => {
    request(app).get("/items").expect(200).end((err, res) => {
      if (err) return done(err)
      res.body.should.be.an("array")
      done()
    })
  })

  it('should add a new item', (done) => {
    request(app)
      .post("/items")
      .send({
        name: 'Guitar',
        type: 'Electric',
        replacement_date: 1682604150,
        progress: 50
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        res.body.should.have.property("id")
        res.body.name.should.equal("Guitar")
        done()
      })
  })

  it('should update an item', (done) => {
    request(app)
      .post("/items")
      .send({
        name: 'Guitar',
        type: 'Electric',
        replacement_date: 1682604150,
        progress: 50
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        const itemId = res.body.id

        request(app)
          .put(`/items/${itemId}`)
          .send({
            name: 'Guitar',
            type: 'Electric',
            replacement_date: 1682604150,
            progress: 75
          })
          .expect(200)
          .end((err, res) => {
            if (err) return done(err)

            res.body.name.should.equal("Guitar")
            res.body.progress.should.equal(75)
            done()
          })
      })
  })

  it('should delete an item', (done) => {
    request(app)
      .post("/items")
      .send({
        name: "Guitar",
        type: "Electric",
        replacement_date: 1682604150,
        progress: 50
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const itemId = res.body.id;
        request(app)
          .delete(`/items/${itemId}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            res.body.message.should.equal("Item deleted successfully");
            done();
          });
      });
  });
})