import db from "../config/db.js";

// ---------------- GET ALL COMPANIES ----------------
export const getAllCompanies = (req, res) => {
  console.log("User Session:", req.session.user);
  const sql = `
    SELECT 
      id,
      company_name,
      company_type_id,
      trading_name,
      registration_no,
      contact_no,
      email,
      website,
      tax_no,
      addressLine,
      city,
      state,
      country,
      zip,
      location_id,
      company_logo,
      is_active,
      created_at,
      updated_at
    FROM companies
    ORDER BY id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({
      companies: result,
    });
  });
};

// ---------------- ADD COMPANY ----------------
export const addCompany = (req, res) => {
  const {
    company_name,
    company_type_id,
    trading_name,
    registration_no,
    contact_no,
    email,
    website,
    tax_no,
    addressLine,
    city,
    state,
    country,
    zip,
    location_id,
    company_logo,
    is_active,
  } = req.body;

  const query = `
    INSERT INTO companies
    (
      company_name,
      company_type_id,
      trading_name,
      registration_no,
      contact_no,
      email,
      website,
      tax_no,
      addressLine,
      city,
      state,
      country,
      zip,
      location_id,
      company_logo,
      is_active
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(
    query,
    [
      company_name,
      company_type_id,
      trading_name,
      registration_no,
      contact_no,
      email,
      website,
      tax_no,
      addressLine,
      city,
      state,
      country,
      zip,
      location_id,
      company_logo,
      is_active,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json({
        message: "Company added successfully",
        id: results.insertId,
      });
    },
  );
};

// ---------------- UPDATE COMPANY ----------------
export const updateCompany = (req, res) => {
  const { id } = req.params;

  const {
    company_name,
    company_type_id,
    trading_name,
    registration_no,
    contact_no,
    email,
    website,
    tax_no,
    addressLine,
    city,
    state,
    country,
    zip,
    company_logo,
    is_active,
  } = req.body;

  const query = `
    UPDATE companies SET
      company_name=?,
      company_type_id=?,
      trading_name=?,
      registration_no=?,
      contact_no=?,
      email=?,
      website=?,
      tax_no=?,
      addressLine=?,
      city=?,
      state=?,
      country=?,
      zip=?,
      company_logo=?,
      is_active=?
    WHERE id=?
  `;

  db.query(
    query,
    [
      company_name,
      company_type_id,
      trading_name,
      registration_no,
      contact_no,
      email,
      website,
      tax_no,
      addressLine,
      city,
      state,
      country,
      zip,
      company_logo,
      is_active,
      id,
    ],
    (err) => {
      if (err) {
        console.log("UPDATE ERROR:", err);
        return res.status(500).json({ message: err.message });
      }

      res.json({
        message: "Company updated successfully",
      });
    },
  );
};

// ---------------- DELETE COMPANY ----------------
export const deleteCompany = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM companies WHERE id=?";

  db.query(query, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      message: "Company deleted successfully",
    });
  });
};

// ---------------- GET MY COMPANY (JWT BASED) ----------------
export const getMyCompany = (req, res) => {
  try {
    const companyId = req.user.company_id; // 🔥 JWT se aa raha hai

    console.log("req.user for company ID:", req.user.company_id);

    const sql = `
      SELECT 
        id,
        company_name,
        company_type_id,
        trading_name,
        registration_no,
        contact_no,
        email,
        website,
        tax_no,
        addressLine,
        city,
        state,
        country,
        zip,
        location_id,
        company_logo,
        is_active,
        created_at,
        updated_at
      FROM companies
      WHERE id = ?
    `;

    db.query(sql, [companyId], (err, result) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json({
        company: result[0],
      });
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE MY COMPANY ----------------
export const updateMyCompany = (req, res) => {
  try {
    const companyId = req.user.company_id; // 🔥 JWT se

    const {
      company_name,
      company_type_id,
      trading_name,
      registration_no,
      contact_no,
      email,
      website,
      tax_no,
      addressLine,
      city,
      state,
      country,
      zip,
      company_logo,
      is_active,
    } = req.body;

    const query = `
      UPDATE companies SET
        company_name=?,
        company_type_id=?,
        trading_name=?,
        registration_no=?,
        contact_no=?,
        email=?,
        website=?,
        tax_no=?,
        addressLine=?,
        city=?,
        state=?,
        country=?,
        zip=?,
        company_logo=?,
        is_active=?
      WHERE id=?
    `;

    db.query(
      query,
      [
        company_name,
        company_type_id,
        trading_name,
        registration_no,
        contact_no,
        email,
        website,
        tax_no,
        addressLine,
        city,
        state,
        country,
        zip,
        company_logo,
        is_active,
        companyId,
      ],
      (err) => {
        if (err) {
          console.log("UPDATE ERROR:", err);
          return res.status(500).json({ message: err.message });
        }

        res.json({
          message: "Company updated successfully",
        });
      },
    );
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
