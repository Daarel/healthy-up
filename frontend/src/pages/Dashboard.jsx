import { useNavigate } from "react-router-dom";
import { 
  Droplets, 
  Apple, 
  Footprints, 
  Moon, 
  UtensilsCrossed, 
  Salad, 
  Dumbbell, 
  Flame, 
  MoreVertical, 
  Scale, 
  TrendingDown, 
  Flag, 
  CalendarDays,
  Check,
  CheckCircle2,
  Circle
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();

  const tasks = [
    { id: 1, title: "Minum air 8 gelas", category: "Hidrasi", completed: true, Icon: Droplets },
    { id: 2, title: "Makan sayur 3 porsi", category: "Nutrisi", completed: false, Icon: Apple },
    { id: 3, title: "Jalan kaki 30 menit", category: "Olahraga", completed: false, Icon: Footprints },
    { id: 4, title: "Tidur 8 jam", category: "Istirahat", completed: false, Icon: Moon },
  ];

  const activities = [
    { time: "07:00", title: "Sarapan sehat", desc: "Oatmeal dengan buah", Icon: UtensilsCrossed },
    { time: "12:00", title: "Makan siang", desc: "Ayam panggang + salad", Icon: Salad },
    { time: "17:00", title: "Workout", desc: "Cardio ringan 30 menit", Icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                Selamat Pagi, Ghifari! 
              </h1>
              <p className="text-[#6d7b6c] font-jakarta mt-1">
                Mari lanjutkan perjalanan sehatmu hari ini
              </p>
            </div>

           
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl whitespace-nowrap">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="whitespace-nowrap">
                <p className="text-sm font-bold text-orange-600 font-lexend leading-none">Streak</p>
                <p className="text-xs text-orange-500 font-jakarta">14 Hari</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Progress Circle Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#191c20] font-lexend">Progress Minggu Ini</h3>
                <MoreVertical className="w-5 h-5 text-[#6d7b6c]" />
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5eeff" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke="#006e2f" strokeWidth="12" fill="none"
                      strokeDasharray={`${0.75 * 351.86} 351.86`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#191c20] font-lexend">75%</span>
                    <span className="text-xs text-[#6d7b6c] font-jakarta">selesai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#191c20] font-lexend">Berat Badan</h3>
                <Scale className="w-5 h-5 text-[#6d7b6c]" />
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#191c20] font-lexend">68.5</span>
                <span className="text-[#6d7b6c] ml-1 font-jakarta">kg</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <TrendingDown className="w-4 h-4" />
                  -1.5 kg
                </span>
                <span className="text-[#6d7b6c] font-jakarta">vs minggu lalu</span>
              </div>
              <div className="mt-4 h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-gradient-to-r from-[#006e2f] to-[#22c55e] rounded-full"></div>
              </div>
              <p className="text-xs text-[#6d7b6c] mt-2 font-jakarta">Target: 65 kg</p>
            </div>

            {/* Calories Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#191c20] font-lexend">Kalori Hari Ini</h3>
                <Flame className="w-5 h-5 text-[#6d7b6c]" />
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#191c20] font-lexend">1,250</span>
                <span className="text-[#6d7b6c] ml-1 font-jakarta">/ 1,800 kkal</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-orange-100 rounded-lg p-2 text-center">
                  <UtensilsCrossed className="w-5 h-5 text-orange-500 mx-auto" />
                  <p className="text-xs font-semibold text-orange-700 font-lexend">450</p>
                </div>
                <div className="flex-1 bg-blue-100 rounded-lg p-2 text-center">
                  <Dumbbell className="w-5 h-5 text-blue-500 mx-auto" />
                  <p className="text-xs font-semibold text-blue-700 font-lexend">-200</p>
                </div>
                <div className="flex-1 bg-green-100 rounded-lg p-2 text-center">
                  <Flag className="w-5 h-5 text-green-500 mx-auto" />
                  <p className="text-xs font-semibold text-green-700 font-lexend">550</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Tasks */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#191c20] font-lexend">Tugas Hari Ini</h3>
                <button 
                  onClick={() => navigate("/tugas")}
                  className="text-sm text-[#006e2f] font-medium hover:underline font-jakarta"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#f8f9ff] transition-colors">
                    <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      task.completed ? "bg-[#006e2f] text-white" : "bg-[#e5eeff] text-[#6d7b6c]"
                    }`}>
                      {task.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <task.Icon className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium font-jakarta ${task.completed ? "text-[#6d7b6c] line-through" : "text-[#191c20]"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#006e2f]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#c1c9bf]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#191c20] font-lexend">Jadwal Hari Ini</h3>
                <CalendarDays className="w-5 h-5 text-[#6d7b6c]" />
              </div>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-[#e5eeff] flex items-center justify-center">
                        <activity.Icon className="w-5 h-5 text-[#006e2f]" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 h-12 bg-[#e5eeff] my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-xs text-[#006e2f] font-semibold font-jakarta">{activity.time}</p>
                      <p className="font-semibold text-[#191c20] font-lexend">{activity.title}</p>
                      <p className="text-sm text-[#6d7b6c] font-jakarta">{activity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 border-2 border-dashed border-[#c1c9bf] rounded-2xl text-[#6d7b6c] font-medium hover:border-[#006e2f] hover:text-[#006e2f] transition-colors font-jakarta">
                + Tambah Aktivitas
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}