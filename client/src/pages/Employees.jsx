import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api, { errMsg } from '../api';

const empty = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  department: '',
  position: '',
  phone: '',
  salary: 0,
  manager: ''
};

export default function Employees() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [form, setForm] = useState(null); // null = hidden
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/users').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const managers = list.filter((u) => u.role === 'manager');

  // Extract unique departments for filter
  const departments = Array.from(new Set(list.map((u) => u.department).filter(Boolean)));

  const edit = (u) => {
    setEditId(u._id);
    setForm({ ...empty, ...u, password: '', manager: u.manager?._id || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      if (editId) await api.put(`/users/${editId}`, form);
      else await api.post('/users', form);
      setForm(null);
      setEditId(null);
      load();
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id, name) => {
    if (!confirm(`Are you sure you want to deactivate and remove ${name || 'this employee'}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (x) {
      alert(errMsg(x));
    }
  };

  const filtered = list.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.position && u.position.toLowerCase().includes(q));

    const matchDept = deptFilter === 'all' || u.department === deptFilter;
    const matchRole = roleFilter === 'all' || u.role === roleFilter;

    return matchSearch && matchDept && matchRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr': return <span className="badge bg-primary"><i className="bi bi-shield-check me-1"></i>HR Admin</span>;
      case 'manager': return <span className="badge bg-warning"><i className="bi bi-person-gear me-1"></i>Manager</span>;
      default: return <span className="badge bg-secondary"><i className="bi bi-person me-1"></i>Employee</span>;
    }
  };

  return (
    <>
      {/* Header with Stats & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center page-header gap-3">
        <div>
          <h3 className="page-title">{isHR ? 'Personnel & Staff Directory' : 'Team Members Directory'}</h3>
          <p className="page-subtitle">Centralized roster of employees, reporting lines, and departmental assignments</p>
        </div>
        {isHR && (
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={() => { setEditId(null); setForm(empty); }}
          >
            <i className="bi bi-person-plus-fill"></i>
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal-like Card */}
      {form && (
        <form className="card p-4 mb-4 border-primary shadow-md" onSubmit={save} style={{ borderTop: '4px solid #0d9488' }}>
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-person-plus'} text-primary`}></i>
              {editId ? 'Update Employee Record' : 'Register New Personnel Profile'}
            </h5>
            <button type="button" className="btn-close" onClick={() => setForm(null)}></button>
          </div>

          {err && <div className="alert alert-danger py-2 mb-3">{err}</div>}

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="e.g. Rachel Adams" value={form.name} onChange={set('name')} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Company Email *</label>
              <input type="email" className="form-control" placeholder="rachel@company.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                {editId ? 'New Password (leave blank to keep)' : 'Initial Password *'}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder={editId ? '••••••••' : 'Min 6 characters'}
                minLength={6}
                value={form.password}
                onChange={set('password')}
                required={!editId}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Access Role</label>
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="employee">Staff Employee</option>
                <option value="manager">Team Manager</option>
                <option value="hr">HR Administrator</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Department</label>
              <input className="form-control" placeholder="Engineering, Sales, etc." value={form.department} onChange={set('department')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Job Title / Position</label>
              <input className="form-control" placeholder="Frontend Architect" value={form.position} onChange={set('position')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Phone Number</label>
              <input className="form-control" placeholder="+1 (555) 234-5678" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Monthly Compensation ($)</label>
              <input type="number" className="form-control" placeholder="6500" value={form.salary} onChange={set('salary')} />
            </div>
            <div className="col-md-5">
              <label className="form-label">Reporting Line / Manager</label>
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">No manager assigned</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.department || 'Management'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-check-lg"></i>
              <span>{editId ? 'Update Record' : 'Save New Employee'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and View Mode Toolbar */}
      <div className="card shadow-sm p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control ps-5 py-2"
                placeholder="Search by name, role, dept, title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted text-decoration-none"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <select className="form-select py-2" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="all">All Departments ({list.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <select className="form-select py-2" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="hr">HR Admins</option>
              <option value="manager">Managers</option>
              <option value="employee">Staff Employees</option>
            </select>
          </div>

          <div className="col-md-2 text-end d-flex justify-content-end gap-1">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid Cards View"
            >
              <i className="bi bi-grid-fill"></i>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="bi bi-table"></i>
            </button>
          </div>
        </div>

        <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
          <span>Showing <strong>{filtered.length}</strong> of {list.length} active records</span>
          {(deptFilter !== 'all' || roleFilter !== 'all' || search) && (
            <button
              className="btn btn-sm btn-link text-decoration-none text-muted p-0"
              onClick={() => { setSearch(''); setDeptFilter('all'); setRoleFilter('all'); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid Cards View */}
      {viewMode === 'grid' ? (
        <div className="row g-3">
          {filtered.map((u) => (
            <div className="col-md-6 col-lg-4" key={u._id}>
              <div className="employee-card shadow-sm">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="employee-avatar-lg">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>{getRoleBadge(u.role)}</div>
                  </div>

                  <h5 className="fw-bold mb-1 text-dark">{u.name}</h5>
                  <div className="text-muted small mb-2">{u.position || 'Staff Member'}</div>

                  <div className="p-2 rounded-2 bg-light mb-3 small d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <i className="bi bi-building text-primary"></i>
                      <span>{u.department || 'General Operations'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <i className="bi bi-envelope text-primary"></i>
                      <span className="text-truncate">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <i className="bi bi-telephone text-primary"></i>
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </div>

                  {u.manager?.name && (
                    <div className="small text-muted mb-3">
                      <span className="text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>Reports to:</span>
                      <span className="badge bg-light text-dark ms-1 border">{u.manager.name}</span>
                    </div>
                  )}
                </div>

                {isHR && (
                  <div className="border-top pt-3 mt-2 d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-soft-primary"
                      onClick={() => edit(u)}
                      title="Edit employee"
                    >
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-soft-danger"
                      onClick={() => del(u._id, u.name)}
                      title="Remove employee"
                    >
                      <i className="bi bi-trash3 me-1"></i> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-12">
              <div className="card p-5 text-center text-muted shadow-sm">
                <i className="bi bi-people fs-1 d-block mb-2 text-black-50"></i>
                No personnel found matching the specified search or filter criteria.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="card shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-modern table-hover mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Reports To</th>
                  {isHR && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 38, height: 38, background: 'var(--primary-gradient)', fontSize: '0.85rem' }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{u.name}</div>
                          <div className="small text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{u.department || <span className="text-muted">-</span>}</td>
                    <td>{u.position || <span className="text-muted">-</span>}</td>
                    <td>
                      {u.manager?.name ? (
                        <span className="badge bg-secondary">{u.manager.name}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    {isHR && (
                      <td className="text-end text-nowrap">
                        <button
                          className="btn btn-sm btn-soft-primary me-2"
                          onClick={() => edit(u)}
                          title="Edit employee"
                        >
                          <i className="bi bi-pencil"></i>
                          <span className="d-none d-md-inline ms-1">Edit</span>
                        </button>
                        <button
                          className="btn btn-sm btn-soft-danger"
                          onClick={() => del(u._id, u.name)}
                          title="Delete employee"
                        >
                          <i className="bi bi-trash3"></i>
                          <span className="d-none d-md-inline ms-1">Delete</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isHR ? 6 : 5} className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-1 d-block mb-2 text-black-50"></i>
                      No employee records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
