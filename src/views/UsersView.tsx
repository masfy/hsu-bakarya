import React from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  UserPlus,
  Search,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Edit3,
  RotateCcw,
} from "lucide-react";
import { UserAccount, UserRole, AccountStatus, Work } from "../types";
import { getDriveDirectImageUrl } from "../utils/drive";

interface UsersViewProps {
  role: UserRole;
  usersList: UserAccount[];
  works: Work[];
  userSearchQuery: string;
  setUserSearchQuery: (q: string) => void;
  userFilterRole: string;
  setUserFilterRole: (r: string) => void;
  showDeletedUsers: boolean;
  setShowDeletedUsers: (b: boolean) => void;
  visiblePasswords: Record<string, boolean>;
  setVisiblePasswords: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onOpenAddUserModal: () => void;
  onEditUser: (u: UserAccount) => void;
  onConfirmDeleteUser: (u: UserAccount) => void;
  onUpdateUserRole: (uid: string, newRole: UserRole) => void;
  onUpdateAccountStatus: (uid: string, newStatus: AccountStatus) => void;
  onRestoreUser: (uid: string) => void;
}

export function UsersView({
  role,
  usersList,
  works,
  userSearchQuery,
  setUserSearchQuery,
  userFilterRole,
  setUserFilterRole,
  showDeletedUsers,
  setShowDeletedUsers,
  visiblePasswords,
  setVisiblePasswords,
  onOpenAddUserModal,
  onEditUser,
  onConfirmDeleteUser,
  onUpdateUserRole,
  onUpdateAccountStatus,
  onRestoreUser,
}: UsersViewProps) {
  const filteredUsers = usersList.filter((u) => {
    // Sembunyikan Super Admin dari Admin & Kontributor
    if (role !== "superAdmin" && u.role === "superAdmin") return false;
    if (!showDeletedUsers && u.isDeleted) return false;
    if (userFilterRole !== "all" && u.role !== userFilterRole) return false;
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.institution.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      key="pengguna"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      {/* Banner */}
      <div className="bg-[#14213D] text-white p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2B84B] text-xs font-extrabold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Manajemen Akun, Kredensial & Hak Akses</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            Daftar Kontributor, Pengelola & Kontrol Akses
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Kelola pendaftaran peserta/kontributor baru, lihat kredensial login (Email, Username & Password),
            ubah peran, setujui akun tertunda, bekukan akses, atau hapus/pulihkan akun.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddUserModal}
          className="bg-[#F2B84B] hover:bg-[#e3a839] text-[#14213D] font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Peserta</span>
        </button>
      </div>

      {/* Filter and Table container */}
      <div className="bg-white p-6 rounded-3xl border border-[#14213D]/10 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#167D78] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Cari nama kontributor, username, email, atau asal sekolah..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#167D78]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={userFilterRole}
              onChange={(e) => setUserFilterRole(e.target.value)}
              className="bg-[#F8F7F2] border border-[#14213D]/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#14213D] outline-none focus:border-[#167D78]"
            >
              <option value="all">Semua Hak Akses (Role)</option>
              <option value="contributor">Kontributor (Guru/Peserta)</option>
              <option value="admin">Admin Kurator</option>
              {role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
            </select>

            <button
              type="button"
              onClick={() => setShowDeletedUsers(!showDeletedUsers)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                showDeletedUsers
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-[#F8F7F2] text-[#727782] border-[#14213D]/15 hover:bg-gray-100"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showDeletedUsers ? "Sembunyikan Terhapus" : "Lihat Akun Terhapus"}</span>
            </button>
          </div>
        </div>

        {/* User items */}
        <div className="divide-y divide-[#14213D]/10">
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#727782]">
              Tidak ditemukan pengguna yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            filteredUsers.map((userItem) => {
              const isPassVisible = !!visiblePasswords[userItem.uid];
              const userWorksCount = works.filter((w) => w.contributorId === userItem.uid && !w.isDeleted).length;

              return (
                <div
                  key={userItem.uid}
                  className={`py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-colors ${
                    userItem.isDeleted ? "opacity-65 bg-rose-50/40 px-4 rounded-2xl" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={getDriveDirectImageUrl(userItem.avatar, "w200") || userItem.avatar}
                      alt={userItem.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#F2B84B] shadow-sm shrink-0 bg-white"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/150x150/14213D/F2B84B?text=User";
                      }}
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-extrabold text-base text-[#14213D]">
                          {userItem.displayName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                            userItem.role === "superAdmin"
                              ? "bg-[#14213D] text-[#F2B84B]"
                              : userItem.role === "admin"
                              ? "bg-[#167D78] text-white"
                              : "bg-[#F2B84B]/30 text-[#14213D]"
                          }`}
                        >
                          {userItem.role === "superAdmin"
                            ? "Super Admin"
                            : userItem.role === "admin"
                            ? "Admin Kurator"
                            : "Kontributor"}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            userItem.isDeleted
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : userItem.accountStatus === "active"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : userItem.accountStatus === "pending"
                              ? "bg-amber-100 text-amber-900 border-amber-400 animate-pulse"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {userItem.isDeleted
                            ? "Terhapus"
                            : userItem.accountStatus === "active"
                            ? "Akses Aktif"
                            : userItem.accountStatus === "pending"
                            ? "Menunggu Persetujuan Admin"
                            : "Dibekukan"}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#167D78]">
                        {userItem.institution} •{" "}
                        <span className="font-normal text-[#727782]">
                          {userItem.district} ({userWorksCount} Karya)
                        </span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 bg-[#F8F7F2] p-3 rounded-2xl border border-[#14213D]/10 text-xs">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#727782] block">
                            Email Login:
                          </span>
                          <span className="font-mono font-bold text-[#14213D] break-all">
                            {userItem.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#727782] block">
                            Username:
                          </span>
                          <span className="font-mono font-bold text-[#167D78]">
                            @{userItem.username}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#727782] block">
                            Password:
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-[#14213D] bg-white px-2 py-0.5 rounded border">
                              {isPassVisible ? userItem.tempPassword || "—" : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setVisiblePasswords((prev) => ({
                                  ...prev,
                                  [userItem.uid]: !prev[userItem.uid],
                                }))
                              }
                              className="p-1 rounded-lg hover:bg-white text-[#727782]"
                              title="Tampilkan / Sembunyikan Password"
                            >
                              {isPassVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!userItem.isDeleted ? (
                      <>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-extrabold uppercase text-[#727782] mb-0.5">
                            Hak Akses:
                          </label>
                          <select
                            value={userItem.role}
                            onChange={(e) =>
                              onUpdateUserRole(userItem.uid, e.target.value as UserRole)
                            }
                            className="px-3 py-2 rounded-xl text-xs font-bold border bg-[#F8F7F2] border-[#14213D]/20 text-[#14213D] outline-none"
                          >
                            <option value="contributor">Kontributor</option>
                            <option value="admin">Admin Kurator</option>
                            {role === "superAdmin" && (
                              <option value="superAdmin">Super Admin</option>
                            )}
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[10px] font-extrabold uppercase text-[#727782] mb-0.5">
                            Status:
                          </label>
                          {userItem.accountStatus === "pending" ? (
                            <button
                              type="button"
                              onClick={() => onUpdateAccountStatus(userItem.uid, "active")}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui Akun</span>
                            </button>
                          ) : userItem.accountStatus === "active" ? (
                            <button
                              type="button"
                              onClick={() => onUpdateAccountStatus(userItem.uid, "suspended")}
                              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                            >
                              Bekukan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateAccountStatus(userItem.uid, "active")}
                              className="px-3.5 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-bold transition-colors"
                            >
                              Aktifkan
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[10px] font-extrabold uppercase text-transparent mb-0.5 select-none">
                            Aksi
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditUser(userItem)}
                              className="px-3 py-2 rounded-xl border border-[#14213D]/15 hover:bg-[#F8F7F2] text-xs font-bold text-[#14213D] transition-colors"
                              title="Edit Data Akun"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onConfirmDeleteUser(userItem)}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRestoreUser(userItem.uid)}
                        className="px-4 py-2 rounded-xl bg-[#167D78] hover:bg-[#14213D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan Akun</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
