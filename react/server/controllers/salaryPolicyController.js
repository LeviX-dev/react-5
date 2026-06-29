import db from "../config/db.js";

/* ================= INSERT HELPERS ================= */

// Earnings Insert Helper
// const insertEarnings = (policyId, earnings, cb) => {
//   let i = 0;

//   const next = () => {
//     if (i >= earnings.length) return cb();

//     const row = earnings[i++];

//     db.query(
//       `INSERT INTO salary_policy_earnings 
//     (policy_id, component, type, value, is_active)
//       VALUES (?, ?, ?, ?, ?)`,
//       [
//         policyId,
//         row.component || "",
//         row.type || "percentage",
//         Number(row.value || 0),
//         row.is_active ?? 1,
//       ],
//       (err) => {
//         if (err) return cb(err);
//         next();
//       }
//     );
//   };

//   next();
// };
const insertEarnings = (policyId, earnings, cb) => {
  let i = 0;

  const next = () => {
    if (i >= earnings.length) return cb();

    const row = earnings[i++];

    const isActive = row.is_active === 0 ? 0 : 1;

    db.query(
      `INSERT INTO salary_policy_earnings 
      (policy_id, component, type, value, is_active)
      VALUES (?, ?, ?, ?, ?)`,
      [
        policyId,
        row.component || "",
        row.type || "percentage",
        Number(row.value || 0),
        isActive,
      ],
      (err) => {
        if (err) return cb(err);
        next();
      }
    );
  };

  next();
};

// Deductions Insert Helper
const insertDeductions = (policyId, deductions, cb) => {
  let i = 0;

  const next = () => {
    if (i >= deductions.length) return cb();

    const row = deductions[i++];

    const isActive = row.is_active === 0 ? 0 : 1;

    db.query(
      `INSERT INTO salary_policy_deductions 
      (policy_id, component, type, value, is_active)
      VALUES (?, ?, ?, ?, ?)`,
      [
        policyId,
        row.component || "",
        row.type || "percentage",
        Number(row.value || 0),
        isActive,
      ],
      (err) => {
        if (err) return cb(err);
        next();
      }
    );
  };

  next();
};



// Contributions Insert Helper
const insertContributions = (policyId, contributions, cb) => {
  let i = 0;

  const next = () => {
    if (i >= contributions.length) return cb();

    const row = contributions[i++];

    const isActive = row.is_active === 0 ? 0 : 1;

    db.query(
      `INSERT INTO salary_policy_contributions 
      (policy_id, component, based_on, type, value, is_active)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        policyId,
        row.component || "",
        row.basedOn || "Basic",
        row.type || "percentage",
        Number(row.value || 0),
        isActive,
      ],
      (err) => {
        if (err) return cb(err);
        next();
      }
    );
  };

  next();
};

export const getEarningsByPolicy = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM salary_policy_earnings WHERE policy_id=?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ data: result });
    }
  );
};
export const getDeductionsByPolicy = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM salary_policy_deductions WHERE policy_id=?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "DB error" });
      }

      res.json({ data: result });
    }
  );
};

export const getContributionsByPolicy = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM salary_policy_contributions WHERE policy_id=?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "DB error" });
      }

      res.json({ data: result });
    }
  );
};
/* ================= CREATE ================= */
export const createSalaryPolicy = (req, res) => {
  const {
    company_id,
    title,
    description,
    earnings = [],
    deductions = [],
    contributions = [],
  } = req.body;

  db.query(
    "INSERT INTO salary_policies (company_id, title, description) VALUES (?, ?, ?)",
    [company_id, title, description],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }

      const policyId = result.insertId;

      insertEarnings(policyId, earnings, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database error" });
        }

        insertDeductions(policyId, deductions, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
          }

          insertContributions(policyId, contributions, (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Database error" });
            }

            res.status(201).json({
              message: "Salary policy created successfully",
              id: policyId,
              sessionUser: req.session.user,
            });
          });
        });
      });
    }
  );
};

/* ================= UPDATE ================= */
export const updateSalaryPolicy = (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    earnings = [],
    deductions = [],
    contributions = [],
  } = req.body;

  db.query(
    "UPDATE salary_policies SET title=?, description=? WHERE id=?",
    [title, description, id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }

      db.query(
        "DELETE FROM salary_policy_earnings WHERE policy_id=?",
        [id],
        (err) => {
          if (err) return res.status(500).json({ message: "Database error" });

          db.query(
            "DELETE FROM salary_policy_deductions WHERE policy_id=?",
            [id],
            (err) => {
              if (err)
                return res.status(500).json({ message: "Database error" });

              db.query(
                "DELETE FROM salary_policy_contributions WHERE policy_id=?",
                [id],
                (err) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ message: "Database error" });

                  insertEarnings(id, earnings, (err) => {
                    if (err)
                      return res
                        .status(500)
                        .json({ message: "Database error" });

                    insertDeductions(id, deductions, (err) => {
                      if (err)
                        return res
                          .status(500)
                          .json({ message: "Database error" });

                      insertContributions(id, contributions, (err) => {
                        if (err)
                          return res
                            .status(500)
                            .json({ message: "Database error" });

                        res.json({
                          message: "Salary policy updated successfully",
                          sessionUser: req.session.user,
                        });
                      });
                    });
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

/* ================= DELETE ================= */
export const deleteSalaryPolicy = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM salary_policies WHERE id=?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({
      message: "Salary policy deleted successfully",
      sessionUser: req.session.user,
    });
  });
};

/* ================= GET ================= */
export const getSalaryPolicies = (req, res) => {
  const sql = "SELECT * FROM salary_policies";

  db.query(sql, (err, policies) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Database error" });
    }

    let count = 0;

    if (policies.length === 0) {
      return res.json({ data: [] });
    }

    policies.forEach((p) => {
      db.query(
        "SELECT * FROM salary_policy_earnings WHERE policy_id=?",
        [p.id],
        (err, earnings) => {
          if (err) return res.status(500).json({ message: "Database error" });

          db.query(
            "SELECT * FROM salary_policy_deductions WHERE policy_id=?",
            [p.id],
            (err, deductions) => {
              if (err)
                return res.status(500).json({ message: "Database error" });

              db.query(
                "SELECT * FROM salary_policy_contributions WHERE policy_id=?",
                [p.id],
                (err, contributions) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ message: "Database error" });

                  p.earnings = earnings;
                  p.deductions = deductions;
                  p.contributions = contributions;

                  count++;

                  if (count === policies.length) {
                    return res.json({
                      data: policies,
                      sessionUser: req.session.user,
                    });
                  }
                }
              );
            }
          );
        }
      );
    });
  });
};