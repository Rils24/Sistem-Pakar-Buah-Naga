import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchHasilDiagnosaByUserId } from '@/services/supabaseService';
import { History, Calendar, Stethoscope, ChevronRight, Loader2 } from 'lucide-react';
import type { User } from '@/types';

interface RiwayatProps {
  user: User;
}

export const Riwayat = ({ user }: RiwayatProps) => {
  const [riwayatList, setRiwayatList] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (cf: number) => {
    if (cf >= 0.7) return 'bg-red-100 text-red-800';
    if (cf >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        <span className="ml-3 text-gray-600">Memuat riwayat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-pink-600" />
          Riwayat Diagnosa
        </h1>
        <p className="text-gray-500">
          Lihat kembali semua hasil diagnosa yang pernah Anda lakukan
        </p>
      </div>

      {/* List */}
      {riwayatList.length > 0 ? (
        <div className="space-y-4">
          {riwayatList.map((item, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {item.nama_penyakit_terpilih || item.hasil_cf?.[0]?.nama_penyakit || 'Tidak diketahui'}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
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
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusColor(item.cf_tertinggi || 0)
                    }`}>
                      {Math.round((item.cf_tertinggi || 0) * 100)}% Kepercayaan
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Riwayat
            </h3>
            <p className="text-gray-500 mb-6">
              Anda belum pernah melakukan diagnosa. Mulai diagnosa sekarang!
            </p>
            <Button 
              onClick={() => window.location.href = '#/user/diagnosa'}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Mulai Diagnosa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detail Diagnosa</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Tanggal */}
              <div className="flex items-center gap-2 text-gray-500">
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

              {/* Hasil Utama */}
              <div className="bg-pink-50 rounded-xl p-6">
                <p className="text-sm text-pink-600 font-medium mb-2">Hasil Diagnosa</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedItem.nama_penyakit_terpilih || selectedItem.hasil_cf?.[0]?.nama_penyakit}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-pink-600">
                    {Math.round((selectedItem.cf_tertinggi || selectedItem.hasil_cf?.[0]?.cf_value || 0) * 100)}%
                  </span>
                  <span className="text-gray-600">Tingkat Kepercayaan</span>
                </div>
              </div>

              {/* Gejala yang Dipilih */}
              {selectedItem.gejala_dipilih && selectedItem.gejala_dipilih.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Gejala yang Dipilih (Ya):</h4>
                  <div className="space-y-2">
                    {selectedItem.gejala_dipilih.map((g: any, idx: number) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700">{g.nama_gejala}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600">CF Pakar: {g.cf_pakar}</span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            CF User: 1 (Ya)
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
                  <h4 className="font-semibold text-gray-900 mb-3">Rekomendasi Solusi:</h4>
                  <div className="space-y-2">
                    {selectedItem.solusi.map((s: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-gray-700 text-sm">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
