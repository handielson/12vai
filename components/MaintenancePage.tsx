import { Wrench, Clock, Home } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card Principal */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* Ícone */}
                    <div className="mb-6">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Wrench className="w-12 h-12 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Em Manutenção
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Estamos trabalhando para melhorar sua experiência!
                        </p>
                    </div>

                    {/* Badge de Tempo */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
                        <div className="flex items-center justify-center gap-2 text-indigo-700">
                            <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                            <span className="font-semibold">Voltaremos em breve</span>
                        </div>
                    </div>

                    {/* Mensagem */}
                    <p className="text-sm text-gray-500 mb-6">
                        Agradecemos sua paciência enquanto realizamos melhorias no sistema VaiEncurta.
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-2">
                            Enquanto isso, que tal um café? ☕
                        </p>
                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                            <Home className="w-4 h-4" />
                            <span className="text-sm font-medium">12vai.com</span>
                        </div>
                    </div>
                </div>

                {/* Badge de Status */}
                <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg text-sm">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        <span className="text-gray-700 font-medium">Manutenção em andamento</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
