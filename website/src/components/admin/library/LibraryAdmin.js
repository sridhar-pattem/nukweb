import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import Cataloging from './Cataloging';
import Circulation from './Circulation';
import Members from './Members';
import Collections from './Collections';
import MembershipPlans from './MembershipPlans';
import Contributors from './Contributors';
import Items from './Items';
import BookForm from './BookForm';
import MemberForm from './MemberForm';
import Import from '../Import';
import '../../../styles/admin-library.css';

const LibraryAdmin = () => {
  return (
    <div className="library-admin-layout">
      <div className="library-admin-header">
        <h1>Library Administration</h1>
        <p>Manage your library's catalog, members, and circulation</p>
      </div>

      {/* Tab Navigation */}
      <nav className="library-tabs">
        <NavLink
          to="/admin/library/cataloging"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Cataloging
        </NavLink>
        <NavLink
          to="/admin/library/circulation"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Circulation
        </NavLink>
        <NavLink
          to="/admin/library/members"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Members
        </NavLink>
        <NavLink
          to="/admin/library/collections"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Collections
        </NavLink>
        <NavLink
          to="/admin/library/membership-plans"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Plans
        </NavLink>
        <NavLink
          to="/admin/library/contributors"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Contributors
        </NavLink>
        <NavLink
          to="/admin/library/import"
          className={({ isActive }) => isActive ? 'tab-link active' : 'tab-link'}
        >
          Import
        </NavLink>
      </nav>

      {/* Tab Content */}
      <div className="library-admin-content">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/library/cataloging" replace />} />
          <Route path="/cataloging" element={<Cataloging />} />
          <Route path="/cataloging/books/new" element={<BookForm />} />
          <Route path="/cataloging/books/:id" element={<BookForm />} />
          <Route path="/cataloging/books/:id/items" element={<Items />} />
          <Route path="/circulation" element={<Circulation />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/new" element={<MemberForm />} />
          <Route path="/members/:id" element={<MemberForm />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/membership-plans" element={<MembershipPlans />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/import" element={<Import />} />
        </Routes>
      </div>
    </div>
  );
};

export default LibraryAdmin;
