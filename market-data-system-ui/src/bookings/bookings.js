import { Component } from 'react';
import DataGrid, {
    Column,
    Editing,
    Paging,
    Pager,
    SearchPanel
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";

export default class Bookings extends Component {
    state = {
        appointments: [],
        loading: true,
        error: null,
        loggedIn: true,
        pushEvent: true
    };

    componentDidMount() {
        const token = localStorage.getItem("token");
        if (!token) {
            this.setState({ loggedIn: false });
            return;
        }

        fetch("http://localhost:8082/booking/api/appointments", {
            headers: {
                "Authorization": "Bearer " + token
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch appointments");
                return res.json();
            })
            .then((data) => {
                console.log("Fetched appointments:", data);
                this.setState({ appointments: data, loading: false });
            })
            .catch((err) =>
                this.setState({ error: err.message, loading: false })
            );
    }

    handleLogout = () => {
        localStorage.removeItem("token");
        this.setState({ loggedIn: false });
        alert("Logged out successfully!");
        window.location.href = "/login";
    };

    handleRowUpdate = (e) => {
        const token = localStorage.getItem("token");
        const updated = { ...e.oldData, ...e.newData };
        const pushEvent = updated.pushEvent || false;

        const url = `http://localhost:8082/booking/api/appointments/update/${updated.id}/${pushEvent}`;

        return fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify(updated)
        })
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                return response.json();
            })
            .then((data) => {
                this.setState((prev) => ({
                    appointments: prev.appointments.map((a) =>
                        a.id === data.id ? data : a
                    )
                }));
            })
            .catch((error) => {
                console.error("Update failed:", error);
                alert("Failed to update appointment.");
            });
    };

    handleRowRemove = (e) => {
        const token = localStorage.getItem("token");

        return fetch(
            `http://localhost:8082/booking/api/appointments/${e.data.id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        )
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                this.setState((prev) => ({
                    appointments: prev.appointments.filter(
                        (a) => a.id !== e.data.id
                    )
                }));
            })
            .catch((error) => {
                console.error("Delete failed:", error);
                alert("Failed to delete appointment.");
            });
    };

    handlePushEventChange = (e) => {
        this.setState({ pushEvent: e.value });
    };

    render() {
        const { appointments, loading, error, loggedIn } = this.state;

        if (!loggedIn) return <div>You have been logged out.</div>;
        if (loading) return <div>Loading booked appointments...</div>;
        if (error) return <div style={{ color: "red" }}>{error}</div>;

        return (
            <div style={{ margin: "30px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}
                >
                    <h2>Booked Appointments</h2>
                    <Button
                        text="Logout"
                        type="danger"
                        stylingMode="contained"
                        onClick={this.handleLogout}
                    />
                </div>

                <DataGrid
                    dataSource={appointments}
                    keyExpr="id"
                    showBorders={true}
                    columnAutoWidth={true}
                    hoverStateEnabled={true}
                    onRowUpdating={this.handleRowUpdate}
                    onRowRemoving={this.handleRowRemove}
                >
                    <SearchPanel visible={true} highlightCaseSensitive={false} placeholder="Search appointments..." />

                    <Editing
                        mode="popup"
                        allowUpdating={true}
                        allowDeleting={true}
                        popup={{
                            title: "Edit Appointment",
                            showTitle: true,
                            width: 600,
                            height: 500
                        }}
                        form={{
                            colCount: 2,
                            items: [
                                "customerName",
                                "customerEmail",
                                "customerPhone",
                                "branch",
                                {
                                    dataField: "appointmentDateTime",
                                    editorType: "dxDateBox",
                                    editorOptions: { type: "datetime" }
                                },
                                "reason",
                                {
                                    dataField: "status",
                                    editorType: "dxSelectBox",
                                    editorOptions: {
                                        items: ["CONFIRMED", "CANCELLED", "SCHEDULED", "COMPLETED"]
                                    }
                                },
                                {
                                    dataField: "pushEvent",
                                    label: { text: "Send Notification" },
                                    editorType: "dxCheckBox"
                                }
                            ]
                        }}
                    />

                    <Column dataField="id" caption="ID" width={70} allowEditing={false} />
                    <Column dataField="branch" caption="Branch" />
                    <Column dataField="customerName" caption="Customer" />
                    <Column dataField="customerEmail" caption="Email" />
                    <Column dataField="customerPhone" caption="Phone" />
                    <Column dataField="appointmentDateTime" caption="Date & Time" dataType="datetime" />
                    <Column dataField="reason" caption="Reason" />
                    <Column dataField="status" caption="Status" />
                    <Column dataField="pushEvent" visible={false} />

                    <Paging defaultPageSize={10} />
                    <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20]} showInfo={true} />
                </DataGrid>

            </div>
        );
    }
}
