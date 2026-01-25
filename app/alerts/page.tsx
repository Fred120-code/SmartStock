"use client";

/**
 * Page de gestion des alertes de stock
 * Affiche toutes les alertes actives et permet de les résoudre
 */

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";

import Wrapper from "../components/Wrapper";
import EmphyState from "../components/EmphyState";
import {
  getActiveAlerts,
  checkAndCreateStockAlerts,
} from "@/app/actions/index";

interface Alert {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    quantity: number;
    minQuantity: number;
    unit: string;
  };
}

const AlertsPage = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Récupère les alertes actives
   */
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      if (email) {
        // Vérifie d'abord s'il y a de nouvelles alertes à créer
        await checkAndCreateStockAlerts(email);
        // Puis récupère les alertes
        const data = await getActiveAlerts(email);
        const formattedAlerts = data.map((alert) => ({
          ...alert,
          createdAt:
            alert.createdAt instanceof Date
              ? alert.createdAt.toISOString()
              : alert.createdAt,
        }));
        setAlerts(formattedAlerts);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      toast.error("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  // Charge les alertes au chargement
  useEffect(() => {
    fetchAlerts();
  }, [email]);

  return (
    <Wrapper>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-warning" />
            Alertes Stock
          </h1>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchAlerts}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : alerts.length === 0 ? (
          <EmphyState message="Aucune alerte Stock" IconComponent="Check" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="card bg-warning/10 border-2 border-warning"
              >
                <div className="card-body">
                  {/* Titre avec icône */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="card-title text-lg">
                        {alert.product.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" />
                  </div>

                  {/* Infos stock */}
                  <div className="divider my-2"></div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Stock actuel</p>
                      <p className="font-bold text-lg">
                        {alert.product.quantity} {alert.product.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Minimum requis</p>
                      <p className="font-bold text-lg text-warning">
                        {alert.product.minQuantity} {alert.product.unit}
                      </p>
                    </div>
                  </div>

                  {/* Date d'alerte */}
                  <p className="text-xs text-gray-500 mt-2">
                    Alerte depuis:{" "}
                    {new Date(alert.createdAt).toLocaleDateString("fr-FR")}
                  </p>

                  {/* Actions */}
                  <div className="card-actions justify-end mt-4">
                    <a
                      href={`/update-product/${alert.product.id}`}
                      className="btn btn-sm btn-info"
                    >
                      Réapprovisionner
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default AlertsPage;
