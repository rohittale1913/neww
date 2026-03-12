// Reusable Table Component
import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const DataTable = ({ 
  columns = [], 
  data = [], 
  loading = false, 
  onEdit = null, 
  onDelete = null,
  emptyMessage = 'No data available'
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left font-semibold text-slate-700">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-left font-semibold text-slate-700">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center text-slate-500">
                <span className="animate-pulse">Loading...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className={`border-b border-slate-100 transition hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-slate-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row._id)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10 p-2 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row._id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
