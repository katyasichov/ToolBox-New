import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./style.scss";
import { connect } from "react-redux";
import Spinner from "../Layout/Spinner";
import ContactItem from "./ContactItem";

import { getFriends } from "../../actions/profile";
//import ContactDisplay from "./ContactDisplay";
import { Link } from "react-router-dom";
//import { deleteContact } from '../../actions/profile';

const Profiles = ({
    getFriends,
   // deleteContact,
    profile: { profiles, loading },
    auth: { user }
  }) => {
    useEffect(() => {
      getFriends();
      
    }, []);
  
  /*  function confirm(e) {
      e.preventDefault();
      confirmAlert({
        title: 'Confirm',
        message: 'Are you sure you want to remove contact.',
        buttons: [
          {
            label: 'Yes',
           // onClick: () => alert('Contact added!'), 
            onClick: () => {
              deleteContact(_id);
              alert('Contact removed!');
            }
          },
          {
            label: 'No',
            //onClick: () => alert('Click No')
          }
        ]
      })
    }  
    */
    const [activeDisplay, setDisplay] = useState();
  
    const updateActive = (profile) => {
      setDisplay(profile)
    }

    return (
        <Fragment>
          {loading ? (
            <Spinner />
          ) : (
          <Fragment>
            <div className="friend-container">
              <h2>Contact Center</h2>
           {/* <h3>Keep track of your contacts for future reference</h3> */ }
              <Link to={`/friends`} className="input-btn">
              <h4>Back to friends</h4>
                  <span className="button-bar"></span>
              </Link>
              <div className="friend-list">
                {profiles.length > 0 ? (
                  profiles.map(profile => (
                        <ContactItem key={profile._id} updateActive={updateActive}   profile={profile} />
                  ))
                ) :
                (
                  <h4>No Contacts Found</h4>
                )}
              </div>
            
            </div>
            
          </Fragment>
        )}
      </Fragment>
    );
  };
  
  Profiles.propTypes = {
    getFriends: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
   // deleteContact: PropTypes.func.isRequired
  };
  
  const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile
  });
  
  export default connect(mapStateToProps, { getFriends })(Profiles);