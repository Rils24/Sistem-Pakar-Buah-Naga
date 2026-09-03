import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fetchHasilDiagnosaByUserId, deleteHasilDiagnosa, fetchPenyakit } from '@/services/supabaseService';
import { 
  History, 
  Calendar, 
  Stethoscope, 
  Loader2, 
  Trash2, 
  Eye, 
  ArrowRight,
  CheckCircle,
  Thermometer,
  AlertTriangle,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import type { User, HasilDiagnosa, Penyakit } from '@/types';

interface RiwayatProps {
  user: User;
}

export const Riwayat = ({ user }: RiwayatProps) => {
  const navigate = useNavigate();
  const [riwayatList, setRiwayatList] = useState<HasilDiagnosa[]>([]);
  const [selectedItem, setSelectedItem] = useState<HasilDiagnosa | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<HasilDiagnosa | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return riwayatList;
    const q = searchQuery.toLowerCase();
    return riwayatList.filter((item) => {
      const penyakitName = item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || '';
      const dateStr = new Date(item.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return penyakitName.toLowerCase().includes(q) || dateStr.toLowerCase().includes(q);
    });
  }, [riwayatList, searchQuery]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const startItem = filteredList.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, pData] = await Promise.all([
        fetchHasilDiagnosaByUserId(user.id),
        fetchPenyakit()
      ]);
      setRiwayatList(data);
      setPenyakitList(pData);
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
      toast.error('Gagal memuat riwayat diagnosa');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (item: HasilDiagnosa) => {
    try {
      setDeleting(true);
      await deleteHasilDiagnosa(item.id);
      setRiwayatList(prev => prev.filter(r => r.id !== item.id));
      setDeleteTarget(null);
      if (selectedItem?.id === item.id) setSelectedItem(null);
      toast.success('Riwayat berhasil dihapus');
    } catch (err) {
      console.error('Gagal menghapus riwayat:', err);
      toast.error('Gagal menghapus riwayat');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      await Promise.all(riwayatList.map(item => deleteHasilDiagnosa(item.id)));
      setRiwayatList([]);
      setCurrentPage(1);
      setDeleteAllConfirm(false);
      setSelectedItem(null);
      toast.success('Semua riwayat berhasil dihapus');
    } catch (err) {
      console.error('Gagal menghapus semua riwayat:', err);
      toast.error('Gagal menghapus riwayat');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (cf: number) => {
    if (cf >= 0.9) return 'bg-green-50 text-green-700 border-green-200';
    if (cf >= 0.7) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (cf >= 0.5) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getCFLabel = (cf: number): string => {
    if (cf >= 0.9) return 'Sangat Yakin';
    if (cf >= 0.7) return 'Yakin';
    if (cf >= 0.5) return 'Cukup Yakin';
    if (cf >= 0.3) return 'Sedikit Yakin';
    return 'Tidak Yakin';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="text-gray-500 text-sm">Memuat riwayat diagnosa...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-pink-600" />
            </span>
            Riwayat Diagnosa
          </h1>
          <p className="text-gray-400 text-sm mt-1 ml-11">
            {riwayatList.length > 0 
              ? `${riwayatList.length} hasil diagnosa tersimpan`
              : 'Belum ada riwayat diagnosa'}
          </p>
        </div>
        {riwayatList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteAllConfirm(true)}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Semua
          </Button>
        )}
      </div>

      {/* Search Input */}
      {riwayatList.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama penyakit atau tanggal diagnosa..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 bg-white border-gray-200 focus:border-pink-500 focus:ring-pink-500 rounded-xl shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* List Riwayat */}
      {filteredList.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedList.map((item, index) => {
              const cfValue = item.cf_tertinggi || 0;
              const penyakitName = item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || 'Tidak diketahui';

              return (
                <Card 
                  key={item.id || index}
                  className="border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
                >
                  <div className="h-1 bg-gradient-to-r from-pink-400 to-rose-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-6 h-6 text-pink-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base truncate">
                          {penyakitName}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* CF Badge & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-pink-600">
                            {(cfValue * 100).toFixed(2)}%
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(cfValue)}`}>
                            {getCFLabel(cfValue)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-pink-600 hover:bg-pink-50"
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                            title="Lihat detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                            title="Hapus riwayat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Card Pagination Control */}
          <Card className="border-0 shadow-md bg-white rounded-xl">
            <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left w-full sm:w-auto">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse flex-shrink-0" />
                <span>
                  Menampilkan <strong className="text-gray-900 font-semibold">{startItem}</strong>–<strong className="text-gray-900 font-semibold">{endItem}</strong> dari <strong className="text-gray-900 font-semibold">{filteredList.length}</strong> riwayat
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 sm:px-2.5 text-xs font-medium border-gray-200 text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all rounded-lg shrink-0"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`dots-${idx}`} className="px-1 text-gray-400 text-xs">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-pink-600 text-white shadow-sm scale-105'
                            : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-transparent'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 sm:px-2.5 text-xs font-medium border-gray-200 text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all rounded-lg shrink-0"
                  title="Halaman Selanjutnya"
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 sm:ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : riwayatList.length > 0 ? (
        /* Empty Search Results */
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-sm">Tidak ada riwayat diagnosa yang cocok dengan "{searchQuery}"</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-3 text-pink-600 border-pink-200 hover:bg-pink-50"
            >
              Reset Pencarian
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <History className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Anda belum pernah melakukan diagnosa. Mulai diagnosa sekarang untuk mengidentifikasi hama & penyakit tanaman Anda.
            </p>
            <Button 
              onClick={() => navigate('/user/diagnosa')}
              className="bg-pink-600 hover:bg-pink-700 h-11 px-6 shadow-md"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Mulai Diagnosa
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          showCloseButton={false}
          onPointerDownOutside={(e) => {
            if (previewImages.length > 0) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (previewImages.length > 0) e.preventDefault();
          }}
        >
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-white relative">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold pr-8">
                Detail Diagnosa
              </DialogTitle>
            </DialogHeader>
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedItem && (
              <div className="mt-3 flex items-center gap-2 text-pink-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(selectedItem.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
          
          {selectedItem && (
            <div className="p-6 space-y-6">
              {/* Hasil Utama */}
              <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <div className="flex-1">
                  <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-1">Hasil Diagnosa Utama</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedItem.nama_penyakit_terpilih || selectedItem.hasil_cf?.[0]?.nama_penyakit}
                  </h3>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-4xl font-extrabold text-pink-600 leading-none">
                    {((selectedItem.cf_tertinggi || selectedItem.hasil_cf?.[0]?.cf_value || 0) * 100).toFixed(2)}%
                  </p>
                  <span className={`mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    getStatusColor(selectedItem.cf_tertinggi || 0)
                  }`}>
                    {getCFLabel(selectedItem.cf_tertinggi || 0)}
                  </span>
                </div>
              </div>

              {/* Semua Hasil CF */}
              {selectedItem.hasil_cf && selectedItem.hasil_cf.length > 1 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                    </span>
                    Semua Kemungkinan
                    <span className="ml-auto text-xs text-gray-400 font-normal">
                      {selectedItem.hasil_cf.length} terdeteksi
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {[...selectedItem.hasil_cf]
                      .sort((a, b) => b.cf_value - a.cf_value)
                      .map((r, idx) => {
                        const val = r.persentase !== undefined ? r.persentase : ((r.cf_value || 0) * 100);
                        const valStr = typeof val === 'number' ? val.toFixed(2) : parseFloat(val).toFixed(2);
                        return (
                          <div key={r.penyakit_id || idx} className={`rounded-xl p-3 border ${
                            idx === 0 ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-100'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${
                                idx === 0 ? 'bg-pink-500' : 'bg-gray-400'
                              }`}>{idx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`font-medium text-sm ${idx === 0 ? 'text-pink-900' : 'text-gray-700'}`}>
                                    {r.nama_penyakit}
                                  </span>
                                  <span className={`text-sm font-bold flex-shrink-0 ${idx === 0 ? 'text-pink-600' : 'text-gray-500'}`}>
                                    {valStr}%
                                  </span>
                                </div>
                                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-pink-400 to-rose-500' : 'bg-gray-400'}`}
                                    style={{ width: `${Math.max(parseFloat(valStr), 2)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Gejala yang Dipilih */}
              {selectedItem.gejala_dipilih && selectedItem.gejala_dipilih.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    </span>
                    Gejala yang Teridentifikasi
                    <span className="ml-auto text-xs text-gray-400 font-normal">
                      {selectedItem.gejala_dipilih.length} gejala
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {selectedItem.gejala_dipilih.map((g, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <span className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700 flex-1">{g.nama_gejala}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-0.5 rounded border border-gray-100">
                            CF Pakar: {g.cf_pakar}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solusi */}
              {selectedItem.solusi && selectedItem.solusi.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                    Rekomendasi Solusi
                  </h4>
                  <div className="space-y-2">
                    {selectedItem.solusi.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gambar Penyakit dari database */}
              {(() => {
                const penyakitId = selectedItem?.penyakit_terpilih;
                const penyakit = penyakitList.find(p => p.id === penyakitId);
                if (!penyakit?.image_urls?.length) return null;
                return (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      </span>
                      Gambar Penyakit
                      <span className="ml-auto text-xs text-gray-400 font-normal">{penyakit.image_urls.length} gambar</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {penyakit.image_urls.map((url, idx) => (
                        <button key={idx}
                          onClick={() => { setPreviewImages(penyakit.image_urls || []); setPreviewIndex(idx); }}
                          className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 hover:border-pink-300 transition-all">
                          <img src={url} alt={`${penyakit.nama} - ${idx+1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Action delete single */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setDeleteTarget(selectedItem);
                  }}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Riwayat Ini
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE SINGLE CONFIRMATION */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">Hapus Riwayat Diagnosa?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Riwayat diagnosa{' '}
              <strong>{deleteTarget?.nama_penyakit_terpilih || deleteTarget?.hasil_cf?.[0]?.nama_penyakit}</strong>{' '}
              akan dihapus secara permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE ALL CONFIRMATION */}
      <AlertDialog open={deleteAllConfirm} onOpenChange={setDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">Hapus Semua Riwayat?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <strong>{riwayatList.length} riwayat diagnosa</strong> akan dihapus secara permanen.
              Tindakan ini tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Hapus Semua</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Modal */}
      <Dialog open={previewImages.length > 0} onOpenChange={(open) => { if (!open) setPreviewImages([]); }}>
        <DialogContent
          className="max-w-4xl w-auto bg-transparent border-none shadow-none p-0 [&>button]:hidden"
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Preview Gambar</DialogTitle>
          </DialogHeader>
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => setPreviewImages([])}
              className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-lg text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {previewImages.length > 0 && (
              <img src={previewImages[previewIndex]} alt="Preview" className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl" />
            )}
            {previewImages.length > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setPreviewIndex(i => i > 0 ? i-1 : previewImages.length-1)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white text-sm font-medium">{previewIndex + 1} / {previewImages.length}</span>
                <button
                  onClick={() => setPreviewIndex(i => i < previewImages.length-1 ? i+1 : 0)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
