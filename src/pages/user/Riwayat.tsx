import { useEffect, useState } from 'react';
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
import { fetchHasilDiagnosaByUserId, deleteHasilDiagnosa } from '@/services/supabaseService';
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
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';

interface RiwayatProps {
  user: User;
}

export const Riwayat = ({ user }: RiwayatProps) => {
  const navigate = useNavigate();
  const [riwayatList, setRiwayatList] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchHasilDiagnosaByUserId(user.id);
      setRiwayatList(data);
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
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

      {/* List */}
      {riwayatList.length > 0 ? (
        <div className="space-y-3">
          {riwayatList.map((item, index) => {
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

                    {/* CF Badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-600">
                          {Math.round(cfValue * 100)}%
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(cfValue)}`}>
                          {getCFLabel(cfValue)}
                        </span>
                      </div>

                      {/* Actions */}
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

      {/* ============================================================ */}
      {/* DETAIL DIALOG */}
      {/* ============================================================ */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold">
                Detail Diagnosa
              </DialogTitle>
            </DialogHeader>
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
                  <p className="text-xs font-medium text-pink-500 uppercase tracking-wider mb-1">Hasil Diagnosa</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedItem.nama_penyakit_terpilih || selectedItem.hasil_cf?.[0]?.nama_penyakit}
                  </h3>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-4xl font-extrabold text-pink-600 leading-none">
                    {Math.round((selectedItem.cf_tertinggi || selectedItem.hasil_cf?.[0]?.cf_value || 0) * 100)}%
                  </p>
                  <span className={`mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    getStatusColor(selectedItem.cf_tertinggi || 0)
                  }`}>
                    {getCFLabel(selectedItem.cf_tertinggi || 0)}
                  </span>
                </div>
              </div>

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
                    {selectedItem.gejala_dipilih.map((g: any, idx: number) => (
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
                    {selectedItem.solusi.map((s: string, idx: number) => (
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

              {/* Actions di dialog */}
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

      {/* ============================================================ */}
      {/* DELETE SINGLE CONFIRMATION */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* DELETE ALL CONFIRMATION */}
      {/* ============================================================ */}
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
    </div>
  );
};
