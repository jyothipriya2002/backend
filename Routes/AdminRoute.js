// import express from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import multer from "multer";
// import path from "path";
// import Connection from "../utils/db.js";
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const Connection = require("../utils/db.js");

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  Connection.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "wrong email or password" });
    }
  });
});

router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  Connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_category", (req, res) => {
  const sql = "INSERT INTO category (`name`) VALUES (?)";
  Connection.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});

// image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});

router.post("/add_employee", upload.single("image"), async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.address ||
      !req.body.salary ||
      !req.body.category_id ||
      !req.file
    ) {
      return res.json({ Status: false, Error: "All fields are required" });
    }

    const categoryCheckSql = "SELECT id FROM category WHERE id = ?";
    Connection.query(
      categoryCheckSql,
      [req.body.category_id],
      async (err, result) => {
        if (err || result.length === 0) {
          return res.json({ Status: false, Error: "Invalid category ID" });
        }

        const hash = await bcrypt.hash(req.body.password, 10);
        const values = [
          req.body.name,
          req.body.email,
          hash,
          req.body.address,
          req.body.salary,
          req.file.filename,
          req.body.category_id,
        ];

        const sql = `INSERT INTO employee (name,email,password,address,salary,image,category_id) VALUES (?)`;
        Connection.query(sql, [values], (err, result) => {
          if (err) {
            console.error("Database Query Error:", err);
            return res.json({
              Status: false,
              Error: "Query Error: " + err.message,
            });
          }
          return res.json({ Status: true });
        });
      }
    );
  } catch (error) {
    console.error("Server Error:", error);
    return res.json({ Status: false, Error: "Server Error" });
  }
});

router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM employee";
  Connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  Connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.put("/edit_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        Where id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id,
  ];
  Connection.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "delete from employee where id = ?";
  Connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_count", (req, res) => {
  const sql = "select count(id) as admin from admin";
  Connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "select count(id) as employee from employee";
  Connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "select sum(salary) as salaryOFEmp from employee";
  Connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_records", (req, res) => {
  const sql = "select * from admin";
  Connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

// export { router as adminRouter };

// module.exports = { adminRouter: router };
module.exports = router

