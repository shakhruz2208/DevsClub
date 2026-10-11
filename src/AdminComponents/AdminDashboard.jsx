import { useCallback, useEffect, useState } from 'react'
import {
  IconActivity,
  IconAlertCircle,
  IconBook2,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react'
import api from '../api'
import { useAuth } from '../Providers/AuthProvider'
import { resolveAvatarUrl } from '../Providers/AuthProvider'
import { isGlobalAdmin } from '../utils/adminAccess'
import { toast } from 'react-toastify'

const PAGE_SIZE = 12
const PANEL = 'rounded-2xl border border-indigo-900/70 bg-[#08133d] shadow-xl shadow-slate-950/20'

const asRows = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.logs)) return data.logs
  return []
}

const displayName = (user) => user.full_name || user.name || user.email || `User #${user.id}`
const userRole = (user) => user.role || user.account_role || (user.teacher ? 'teacher' : 'student')
const userIsActive = (user) => user.is_active ?? user.active ?? user.status !== 'blocked'
const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}
const metricValue = (data, keys) => {
  for (const key of keys) {
    if (data?.[key] !== undefined && data?.[key] !== null) return data[key]
  }
  return null
}

const ErrorState = ({ message, onRetry }) => (
  <div className='flex flex-col items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-8 text-center'>
    <IconAlertCircle size={24} className='text-rose-300' />
    <p className='max-w-xl text-sm text-rose-100'>{message}</p>
    <button onClick={onRetry} className='rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-bold text-rose-100 hover:bg-rose-400/10'>
      Qayta urinish
    </button>
  </div>
)

const StatCard = ({ icon: Icon, label, value, accent = 'text-indigo-300' }) => (
  <div className={`${PANEL} p-5`}>
    <div className='flex items-center justify-between gap-3'>
      <p className='text-sm font-medium text-slate-400'>{label}</p>
      <span className={`rounded-xl bg-white/5 p-2 ${accent}`}><Icon size={20} /></span>
    </div>
    <p className='mt-4 text-3xl font-extrabold text-white'>{value === null ? '—' : Number(value).toLocaleString()}</p>
  </div>
)

const AdminDashboard = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [overviewError, setOverviewError] = useState('')
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [usersError, setUsersError] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsError, setLogsError] = useState('')
  const [logsLoading, setLogsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalUsers, setTotalUsers] = useState(null)
  const [busyUserId, setBusyUserId] = useState(null)

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true)
    setOverviewError('')
    try {
      const response = await api.get('/admin/overview')
      setOverview(response.data)
    } catch (error) {
      console.error('Admin overview request failed', error)
      setOverviewError(error.response?.data?.detail || 'Statistikani yuklab bo‘lmadi. Backendda /admin/overview endpointi va admin ruxsati kerak.')
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const response = await api.get('/admin/users', {
        params: { skip: page * PAGE_SIZE, limit: PAGE_SIZE, search: search || undefined },
      })
      setUsers(asRows(response.data))
      setTotalUsers(response.data?.total ?? response.data?.total_count ?? null)
    } catch (error) {
      console.error('Admin users request failed', error)
      setUsersError(error.response?.data?.detail || 'Foydalanuvchilarni yuklab bo‘lmadi. Backendda /admin/users endpointi va admin ruxsati kerak.')
    } finally {
      setUsersLoading(false)
    }
  }, [page, search])

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    setLogsError('')
    try {
      const response = await api.get('/admin/audit-logs', { params: { skip: 0, limit: 20 } })
      setLogs(asRows(response.data))
    } catch (error) {
      console.error('Admin audit log request failed', error)
      setLogsError(error.response?.data?.detail || 'Audit loglarni yuklab bo‘lmadi. Backendda /admin/audit-logs endpointi va admin ruxsati kerak.')
    } finally {
      setLogsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.get('/admin/overview')
      .then((response) => { if (active) setOverview(response.data) })
      .catch((error) => {
        console.error('Admin overview request failed', error)
        if (active) setOverviewError(error.response?.data?.detail || 'Statistikani yuklab bo‘lmadi. Backendda /admin/overview endpointi va admin ruxsati kerak.')
      })
      .finally(() => { if (active) setOverviewLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (tab !== 'users') return undefined
    let active = true
    api.get('/admin/users', {
      params: { skip: page * PAGE_SIZE, limit: PAGE_SIZE, search: search || undefined },
    })
      .then((response) => {
        if (!active) return
        setUsers(asRows(response.data))
        setTotalUsers(response.data?.total ?? response.data?.total_count ?? null)
      })
      .catch((error) => {
        console.error('Admin users request failed', error)
        if (active) setUsersError(error.response?.data?.detail || 'Foydalanuvchilarni yuklab bo‘lmadi. Backendda /admin/users endpointi va admin ruxsati kerak.')
      })
      .finally(() => { if (active) setUsersLoading(false) })
    return () => { active = false }
  }, [tab, page, search])

  useEffect(() => {
    if (tab !== 'logs') return undefined
    let active = true
    api.get('/admin/audit-logs', { params: { skip: 0, limit: 20 } })
      .then((response) => { if (active) setLogs(asRows(response.data)) })
      .catch((error) => {
        console.error('Admin audit log request failed', error)
        if (active) setLogsError(error.response?.data?.detail || 'Audit loglarni yuklab bo‘lmadi. Backendda /admin/audit-logs endpointi va admin ruxsati kerak.')
      })
      .finally(() => { if (active) setLogsLoading(false) })
    return () => { active = false }
  }, [tab])

  const updateUser = async (target, changes, successMessage) => {
    setBusyUserId(target.id)
    try {
      if (changes.role) {
        await api.patch(`/admin/users/${target.id}/role`, { role: changes.role })
      } else {
        await api.patch(`/admin/users/${target.id}/status`, { is_active: changes.is_active })
      }
      toast.success(successMessage)
      await fetchUsers()
    } catch (error) {
      console.error('Admin user update failed', error)
      toast.error(error.response?.data?.detail || 'Foydalanuvchini yangilab bo‘lmadi. Backend ruxsatlarini tekshiring.')
    } finally {
      setBusyUserId(null)
    }
  }

  const applySearch = (event) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
    setUsersLoading(true)
  }

  const isAdmin = isGlobalAdmin(user)
  if (!isAdmin) return null

  const totalPages = totalUsers === null ? null : Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))
  const tabs = [
    { id: 'overview', label: 'Umumiy ko‘rinish', icon: IconActivity },
    { id: 'users', label: 'Foydalanuvchilar', icon: IconUsers },
    { id: 'logs', label: 'Audit loglar', icon: IconShieldCheck },
  ]

  return (
    <div className='min-h-screen bg-[#03071e] px-4 py-8 text-white sm:px-6 lg:px-10'>
      <div className='mx-auto max-w-7xl'>
        <header className='mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
          <div>
            <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200'>
              <IconShieldCheck size={15} /> Admin control panel
            </div>
            <h1 className='text-3xl font-black tracking-tight sm:text-4xl'>Boshqaruv paneli</h1>
            <p className='mt-2 text-sm text-slate-400'>Foydalanuvchilar va platforma holatini boshqaring.</p>
          </div>
          <button
            onClick={() => {
              if (tab === 'overview') { setOverviewError(''); setOverviewLoading(true); fetchOverview() }
              if (tab === 'users') { setUsersError(''); setUsersLoading(true); fetchUsers() }
              if (tab === 'logs') { setLogsError(''); setLogsLoading(true); fetchLogs() }
            }}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-800 bg-[#0b1744] px-4 py-2.5 text-sm font-bold text-indigo-100 transition hover:border-indigo-500 hover:bg-indigo-950'
          >
            <IconRefresh size={17} /> Yangilash
          </button>
        </header>

        <nav className='mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-indigo-950 bg-[#060e2c] p-2'>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id)
                if (id === 'users') { setUsersError(''); setUsersLoading(true) }
                if (id === 'logs') { setLogsError(''); setLogsLoading(true) }
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <section>
            {overviewError ? <ErrorState message={overviewError} onRetry={fetchOverview} /> : overviewLoading ? (
              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {[0, 1, 2, 3].map((item) => <div key={item} className={`${PANEL} h-32 animate-pulse bg-indigo-950/40`} />)}
              </div>
            ) : (
              <>
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                  <StatCard icon={IconUsers} label='Jami foydalanuvchilar' value={metricValue(overview, ['total_users', 'users_total', 'user_count'])} />
                  <StatCard icon={IconUsers} label='Faol foydalanuvchilar' value={metricValue(overview, ['active_users', 'users_active'])} accent='text-emerald-300' />
                  <StatCard icon={IconBook2} label='Kurslar / guruhlar' value={metricValue(overview, ['total_courses', 'courses_total', 'total_groups', 'groups_total'])} accent='text-violet-300' />
                  <StatCard icon={IconActivity} label='Vazifalar' value={metricValue(overview, ['total_assignments', 'assignments_total', 'assignment_count'])} accent='text-amber-300' />
                </div>
                <div className={`${PANEL} mt-5 p-5 sm:p-6`}>
                  <h2 className='text-lg font-extrabold'>Boshqaruv eslatmasi</h2>
                  <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-400'>
                    Administrator amallari backendda ham tekshirilishi shart. Frontenddagi admin sahifasi ruxsatni himoya qilmaydi; server har bir /admin endpointida administrator rolini tasdiqlashi kerak.
                  </p>
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'users' && (
          <section className={`${PANEL} overflow-hidden`}>
            <div className='flex flex-col gap-4 border-b border-indigo-950 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
              <div>
                <h2 className='text-lg font-extrabold'>Foydalanuvchilar</h2>
                <p className='mt-1 text-xs text-slate-500'>Rolni o‘zgartirish yoki akkauntni vaqtincha bloklash.</p>
              </div>
              <form onSubmit={applySearch} className='flex w-full gap-2 sm:max-w-md'>
                <label className='flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-indigo-900 bg-[#030a25] px-3'>
                  <IconSearch size={17} className='shrink-0 text-slate-500' />
                  <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder='Ism yoki email bo‘yicha qidirish' className='min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-600' />
                </label>
                <button className='rounded-xl bg-indigo-600 px-4 text-sm font-bold hover:bg-indigo-500'>Qidirish</button>
              </form>
            </div>

            {usersError ? <div className='p-4 sm:p-5'><ErrorState message={usersError} onRetry={fetchUsers} /></div> : (
              <>
                <div className='overflow-x-auto'>
                  <table className='w-full min-w-[780px] text-left text-sm'>
                    <thead className='bg-[#060e2c] text-xs uppercase tracking-wide text-slate-500'>
                      <tr>
                        <th className='px-5 py-3 font-bold'>Foydalanuvchi</th>
                        <th className='px-5 py-3 font-bold'>Rol</th>
                        <th className='px-5 py-3 font-bold'>Holat</th>
                        <th className='px-5 py-3 font-bold'>Ro‘yxatdan o‘tgan</th>
                        <th className='px-5 py-3 text-right font-bold'>Amal</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-indigo-950/80'>
                      {usersLoading ? (
                        <tr><td colSpan='5' className='px-5 py-12 text-center text-slate-500'>Yuklanmoqda...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan='5' className='px-5 py-12 text-center text-slate-500'>Foydalanuvchi topilmadi.</td></tr>
                      ) : users.map((target) => {
                        const active = userIsActive(target)
                        const self = String(target.id) === String(user?.id)
                        const avatar = resolveAvatarUrl(target.profile_pic || target.avatar_url)
                        return (
                          <tr key={target.id} className='transition hover:bg-white/[0.025]'>
                            <td className='px-5 py-4'>
                              <div className='flex items-center gap-3'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-900 font-bold text-indigo-100'>
                                  {avatar ? <img src={avatar} alt='' className='h-full w-full object-cover' /> : displayName(target).slice(0, 1).toUpperCase()}
                                </div>
                                <div className='min-w-0'>
                                  <p className='truncate font-bold text-slate-100'>{displayName(target)}</p>
                                  <p className='truncate text-xs text-slate-500'>{target.email || `ID: ${target.id}`}</p>
                                </div>
                              </div>
                            </td>
                            <td className='px-5 py-4'>
                              <select
                                value={userRole(target)}
                                disabled={self || busyUserId === target.id}
                                onChange={(event) => updateUser(target, { role: event.target.value }, 'Foydalanuvchi roli yangilandi')}
                                className='rounded-lg border border-indigo-900 bg-[#030a25] px-2.5 py-2 text-xs font-bold text-indigo-100 outline-none disabled:opacity-50'
                                aria-label={`${displayName(target)} roli`}
                              >
                                <option value='student'>O‘quvchi</option>
                                <option value='teacher'>O‘qituvchi</option>
                                <option value='admin'>Admin</option>
                              </select>
                            </td>
                            <td className='px-5 py-4'>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                {active ? 'Faol' : 'Bloklangan'}
                              </span>
                            </td>
                            <td className='px-5 py-4 text-xs text-slate-400'>{formatDate(target.created_at || target.createdAt)}</td>
                            <td className='px-5 py-4 text-right'>
                              <button
                                disabled={self || busyUserId === target.id}
                                onClick={() => updateUser(target, { is_active: !active }, active ? 'Akkaunt bloklandi' : 'Akkaunt faollashtirildi')}
                                className={`rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-rose-500/20 text-rose-300 hover:bg-rose-500/10' : 'border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10'}`}
                              >
                                {busyUserId === target.id ? 'Saqlanmoqda…' : active ? 'Bloklash' : 'Faollashtirish'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className='flex items-center justify-between border-t border-indigo-950 px-4 py-3 sm:px-5'>
                  <p className='text-xs text-slate-500'>
                    {totalUsers === null ? `Sahifa ${page + 1}` : `${totalUsers.toLocaleString()} ta foydalanuvchi · sahifa ${page + 1}/${totalPages}`}
                  </p>
                  <div className='flex gap-2'>
                    <button disabled={page === 0 || usersLoading} onClick={() => setPage((value) => value - 1)} className='rounded-lg border border-indigo-900 p-2 text-slate-300 hover:bg-white/5 disabled:opacity-30' aria-label='Oldingi sahifa'><IconChevronLeft size={17} /></button>
                    <button disabled={usersLoading || (totalPages !== null ? page + 1 >= totalPages : users.length < PAGE_SIZE)} onClick={() => setPage((value) => value + 1)} className='rounded-lg border border-indigo-900 p-2 text-slate-300 hover:bg-white/5 disabled:opacity-30' aria-label='Keyingi sahifa'><IconChevronRight size={17} /></button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'logs' && (
          <section className={`${PANEL} overflow-hidden`}>
            <div className='border-b border-indigo-950 p-5'>
              <h2 className='text-lg font-extrabold'>Administrator amallari</h2>
              <p className='mt-1 text-xs text-slate-500'>Rol va akkaunt holati kabi muhim o‘zgarishlar tarixi.</p>
            </div>
            {logsError ? <div className='p-4 sm:p-5'><ErrorState message={logsError} onRetry={fetchLogs} /></div> : logsLoading ? (
              <p className='px-5 py-12 text-center text-sm text-slate-500'>Yuklanmoqda...</p>
            ) : logs.length === 0 ? (
              <p className='px-5 py-12 text-center text-sm text-slate-500'>Hozircha audit yozuvlari yo‘q.</p>
            ) : (
              <div className='divide-y divide-indigo-950/80'>
                {logs.map((log, index) => (
                  <article key={log.id || `${log.created_at}-${index}`} className='flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <p className='font-bold text-slate-100'>{log.action || log.event || log.description || 'Admin amali'}</p>
                      <p className='mt-1 text-xs text-slate-500'>
                        {log.actor_name || log.admin_email || log.actor?.email || 'Administrator'}
                        {log.target_name || log.target_id ? ` → ${log.target_name || `#${log.target_id}`}` : ''}
                      </p>
                    </div>
                    <time className='shrink-0 text-xs text-slate-500'>{formatDate(log.created_at || log.createdAt)}</time>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
