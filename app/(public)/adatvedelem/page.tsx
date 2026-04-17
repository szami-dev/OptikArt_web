import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adatkezelési Tájékoztató | Monostori Márk ev.',
  description: 'Monostori Márk egyéni vállalkozó hivatalos adatkezelési tájékoztatója.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Adatkezelési Tájékoztató
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Fontos számunkra az Ön személyes adatainak védelme és a jogszabályi megfelelőség.
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12 space-y-12 text-gray-700 leading-relaxed">
          
          {/* 1. Bevezetés */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">1. Bevezetés</h2>
            <p>
              Ezen adatkezelési tájékoztató célja, hogy tájékoztatást nyújtson az általunk végzett adatkezelési tevékenységekről, 
              az érintettek jogairól, valamint az adatkezeléssel kapcsolatos eljárásokról. Fontos számunkra az Ön személyes 
              adatainak védelme és az, hogy a vonatkozó jogszabályoknak megfelelően járjunk el.
            </p>
          </section>

          {/* 2. Adatkezelő */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Adatkezelő</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500 font-medium">Név</p>
                <p className="font-semibold text-slate-800">Monostori Márk ev.</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500 font-medium">Székhely</p>
                <p className="font-semibold text-slate-800">6131 Szank, Arany János utca 5.</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-500 font-medium">Elérhetőség</p>
                <p className="font-semibold text-slate-800">+36 20 427 4006</p>
              </div>
            </div>
          </section>

          {/* 3. Az adatkezelés célja és jogalapja */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">3. Az adatkezelés célja és jogalapja</h2>
            <p className="mb-4">Személyes adatait az alábbi célokból kezeljük:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Szolgáltatásaink nyújtása és fejlesztése</li>
              <li>Ügyfélszolgálati tevékenységek</li>
              <li>Hírlevelek és marketinganyagok küldése</li>
              <li>Jogi kötelezettségek teljesítése</li>
            </ul>
            <p className="italic text-slate-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <span className="font-bold">Az adatkezelés jogalapja:</span> az Ön hozzájárulása, szerződés teljesítése, jogi kötelezettségek teljesítése, valamint jogos érdek.
            </p>
          </section>

          {/* 4. Kezelt adatok köre */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">4. Kezelt adatok köre</h2>
            <p className="mb-4">
              Az általunk kezelt személyes adatok köre az adott szolgáltatástól függően eltérő lehet, de jellemzően az alábbi adatokat gyűjtjük és kezeljük:
            </p>
            <div className="flex flex-wrap gap-3">
              {['IP cím', 'Hely', 'Név', 'Időpont', 'Elérési mód'].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* 5. Adatkezelés időtartama */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">5. Adatkezelés időtartama</h2>
            <p className="mb-4">Személyes adatait csak a szükséges ideig tároljuk, az alábbiak szerint:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 border-b font-semibold text-slate-900">Adat típusa</th>
                    <th className="p-4 border-b font-semibold text-slate-900">Megőrzési idő</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b">Szolgáltatás nyújtásával kapcsolatos adatok</td>
                    <td className="p-4 border-b">A szerződés megszűnését követően.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Számlázási adatok</td>
                    <td className="p-4 border-b">A számlázási időszak végét követően (jogszabály szerint).</td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b">Marketing célú adatkezelés</td>
                    <td className="p-4 border-b">A hozzájárulás visszavonásáig.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Adattovábbítás és adatfeldolgozók */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">6. Adattovábbítás és adatfeldolgozók</h2>
            <p>
              Személyes adatait harmadik fél számára csak az Ön hozzájárulásával, jogszabályi kötelezettség teljesítése érdekében, 
              vagy jogos érdek alapján továbbítjuk. Az adatfeldolgozókkal kötött szerződések biztosítják az adatok megfelelő védelmét.
            </p>
          </section>

          {/* 7. Az érintettek jogai */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">7. Az érintettek jogai</h2>
            <p className="mb-4">Ön jogosult az alábbiakra:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Tájékoztatást kérni az adatkezelésről',
                'Hozzáférni személyes adataihoz',
                'Helyesbítést kérni',
                'Törlést kérni',
                'Az adatkezelés korlátozását kérni',
                'Adathordozhatóságot kérni',
                'Tiltakozni az adatkezelés ellen',
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Jogorvoslati lehetőségek */}
          <section className="bg-red-50 p-6 rounded-xl border border-red-100">
            <h2 className="text-2xl font-semibold text-red-900 mb-4">8. Jogorvoslati lehetőségek</h2>
            <p className="mb-4">Amennyiben úgy érzi, hogy jogai sérültek, panaszt nyújthat be a felügyeleti hatóságnál:</p>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Bács-Kiskun Vármegyei Kormányhivatal</p>
              <p>Cím: 6000 Kecskemét, Deák Ferenc tér 3.</p>
              <p>Telefon: +36 76 513-713</p>
              <p>E-mail: <a href="mailto:hivatal@bacs.gov.hu" className="text-blue-600 hover:underline">hivatal@bacs.gov.hu</a></p>
            </div>
          </section>

          {/* 9. Kapcsolat */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 border-b pb-2">9. Kapcsolat</h2>
            <p className="mb-6">
              Amennyiben kérdése van az adatkezeléssel kapcsolatban, kérjük, lépjen velünk kapcsolatba az alábbi elérhetőségek egyikén:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="mailto:business@optikart.hu" className="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-500 mb-1">Email</span>
                <span className="font-medium text-slate-900">business@optikart.hu</span>
              </a>
              <a href="tel:+36204274006" className="flex flex-col items-center p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-500 mb-1">Telefon</span>
                <span className="font-medium text-slate-900">+36 20 427 4006</span>
              </a>
              <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-500 mb-1">Postai cím</span>
                <span className="font-medium text-slate-900 text-center text-sm sm:text-base">6131 Szank, Arany J. u. 5.</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 border-t text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Monostori Márk ev. Minden jog fenntartva.</p>
          <p className="mt-1 italic">Utolsó frissítés: 2024. május 22.</p>
        </div>
      </div>
    </div>
  );
}